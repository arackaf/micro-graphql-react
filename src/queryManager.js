import { defaultClientManager } from "./client";

export default class QueryManager {
  constructor({ client, refreshCurrent, hookRefs, cache, setState, suspense }) {
    const { isActiveRef, queryStateRef } = hookRefs;
    Object.assign(this, { client, cache, isActiveRef, queryStateRef, refreshCurrent, suspense, setState });
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
        this.currentPromise = null;
        this.updateState(
          { data: cachedEntry.data, error: cachedEntry.error || null, loading: false, loaded: true, currentQuery: graphqlQuery },
          queryState
        );
      },
      () => {
        let promise = this.execute(graphqlQuery);
        this.currentPromise = promise;
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
      if (promise !== this.currentPromise) {
        this.currentPromise = promise;
        this.currentPromise
          .then(() => {
            this.refresh();
          })
          .catch(() => {
            this.refresh();
          });
      }
    }
  }
  execute(graphqlQuery) {
    let promise = this.client.runUri(graphqlQuery);
    this.cache.setPendingResult(graphqlQuery, promise);
    return Promise.resolve(promise)
      .then(resp => {
        this.currentPromise = null;
        this.cache.setResults(promise, graphqlQuery, resp);
        this.refresh();
      })
      .catch(err => {
        this.currentPromise = null;
        this.cache.setResults(promise, graphqlQuery, null, err);
        this.refresh();
      });
  }
}
