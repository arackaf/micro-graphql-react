import compress from "graphql-query-compress";
import ClientBase from "../src/client";

export default class Client extends ClientBase {
  constructor(endpoint) {
    super(endpoint);
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
    return this.nextResult || {};
  };
  runMutation = (mutation, variables) => {
    this.mutationsRun++;
    this.mutationCalls.push([mutation, variables]);
  };
}
