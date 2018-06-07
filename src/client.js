const mutationListenersSymbol = Symbol("mutationListeners");

export default class Client {
  constructor(props) {
    Object.assign(this, props);
    this.caches = new Map([]);
    this[mutationListenersSymbol] = new Set([]);
  }
  getCache(query) {
    return this.caches.get(query);
  }
  setCache(query, cache) {
    this.caches.set(query, cache);
    return cache;
  }
  runQuery(query, variables) {
    return fetch(this.getGraphqlQuery({ query, variables }), this.fetchOptions || void 0).then(resp => resp.json());
  }
  getGraphqlQuery({ query, variables }) {
    return `${this.endpoint}?query=${encodeURIComponent(query)}${typeof variables === "object" ? `&variables=${JSON.stringify(variables)}` : ""}`;
  }
  subscribeMutation(subscription, options) {
    this[mutationListenersSymbol].add({ subscription, options });

    return () => this[mutationListenersSymbol].delete(subscription);
  }
  processMutation(mutation, variables) {
    return Promise.resolve(this.runMutation(mutation, variables)).then(resp => {
      let mutationKeys = Object.keys(resp);
      let mutationKeysLookup = new Set(mutationKeys);
      [...this[mutationListenersSymbol]].forEach(({ subscription, options: { currentResults, ...rest } }) => {
        subscription.forEach(singleSubscription => {
          if (typeof singleSubscription.when === "string") {
            if (mutationKeysLookup.has(singleSubscription.when)) {
              singleSubscription.run(variables, resp, { currentResults: currentResults(), ...rest });
            }
          } else if (typeof singleSubscription.when === "object" && singleSubscription.when.test) {
            if ([...mutationKeysLookup].some(k => singleSubscription.when.test(k))) {
              singleSubscription.run(resp, { currentResults: currentResults(), ...rest });
            }
          }
        });
      });
      return resp;
    });
  }
  runMutation(mutation, variables) {
    let { headers = {}, ...otherOptions } = this.fetchOptions;
    return fetch(this.endpoint, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers
      },
      ...otherOptions,
      body: JSON.stringify({
        query: mutation,
        variables
      })
    })
      .then(resp => resp.json())
      .then(resp => resp.data);
  }
}

class DefaultClientManager {
  defaultClient = null;
  setDefaultClient = client => (this.defaultClient = client);
  getDefaultClient = () => this.defaultClient;
}

export const defaultClientManager = new DefaultClientManager();
