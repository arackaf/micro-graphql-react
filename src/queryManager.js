import { defaultClientManager } from "./client";

export default class QueryManager {
  constructor({ client, refreshCurrent, hookRefs, cache, setState, suspense }) {
    const { isActiveRef, queryStateRef } = hookRefs;
    Object.assign(this, { client, cache, isActiveRef, queryStateRef, refreshCurrent, suspense, setState });

    this.trackedPromises = new Set([]);
  }
  updateState(newState, existingState) {
    if (!this.setState) {
      return;
    }

    if (existingState) {
      const doUpdate = Object.keys(newState).some(k => newState[k] !== existingState[k]);
      if (!doUpdate) return;
    }

    this.setState(state => Object.assign({}, state, newState));
  }

  sync({ query, variables, queryState }) {
    let graphqlQuery = this.client.getGraphqlQuery({ query, variables });
    this.cache.getFromCache(
      graphqlQuery,
      promise => {
        this.promisePending(promise, queryState);
      },
      cachedEntry => {
        this.updateState(
          { data: cachedEntry.data, error: cachedEntry.error || null, loading: false, loaded: true, currentQuery: graphqlQuery },
          queryState
        );
      },
      () => {
        let promise = this.execute(graphqlQuery);
        this.trackedPromises.add(promise);
        this.promisePending(promise, queryState);
      }
    );
  }

  refresh() {
    this.refreshCurrent && this.refreshCurrent();
  }

  promisePending(promise, queryState) {
    if (this.suspense) {
      throw promise;
    } else {
      this.updateState({ loading: true }, queryState);
      if (!this.trackedPromises.has(promise)) {
        this.trackedPromises.add(promise);
        promise.then(() => this.refresh()).catch(() => this.refresh());
      }
    }
  }
  execute(graphqlQuery) {
    let promise = this.client.runUri(graphqlQuery);
    this.cache.setPendingResult(graphqlQuery, promise);
    return Promise.resolve(promise)
      .then(resp => {
        this.trackedPromises.delete(promise);
        this.cache.setResults(promise, graphqlQuery, resp);
        this.refresh();
      })
      .catch(err => {
        this.trackedPromises.delete(promise);
        this.cache.setResults(promise, graphqlQuery, null, err);
        this.refresh();
      });
  }
}
