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
  processMutation(mutation, variables) {
    return this.runMutation(mutation, variables).then(resp => {
      [...this[mutationListenersSymbol]].forEach(f => f(resp));
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
