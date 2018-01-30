import compress from "graphql-query-compress";
import { GraphQLClient } from "graphql-request";

export default class Client {
  constructor(props) {
    Object.assign(this, props);
    this.__mutationClient = new GraphQLClient(this.endpoint, this.fetchOptions);
    if (this.cacheSize == null) {
      this.cacheSize = 10;
    }
  }
  runQuery(query, variables) {
    return fetch(this.getGraphqlQuery({ query, variables }), this.fetchOptions || void 0).then(resp => resp.json());
  }
  getGraphqlQuery({ query, variables }) {
    return `${this.endpoint}?query=${encodeURIComponent(compress(query))}${
      typeof variables === "object" ? `&variables=${JSON.stringify(variables)}` : ""
    }`;
  }
  runMutation(mutation, variables) {
    return this.__mutationClient.request(mutation, variables);
  }
}
