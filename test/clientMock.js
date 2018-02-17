import compress from "graphql-query-compress";

export default class Client {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.reset();
  }
  reset = () => {
    this.queriesRun = 0;
    this.queryCalls = [];

    this.mutationsRun = 0;
    this.mutationCalls = [];
  };

  runQuery = (query, variables) => {
    this.queriesRun++;
    this.queryCalls.push([query, variables]);
  };
  getGraphqlQuery({ query, variables }) {
    return `${this.endpoint}?query=${encodeURIComponent(compress(query))}${
      typeof variables === "object" ? `&variables=${JSON.stringify(variables)}` : ""
    }`;
  }
  runMutation = (mutation, variables) => {
    this.mutationsRun++;
    this.mutationCalls.push([mutation, variables]);
  };
}
