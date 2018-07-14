import ClientBase from "../src/client";

export default class Client extends ClientBase {
  constructor(props) {
    super(props);
    this.reset();
  }
  reset = () => {
    this.queriesRun = 0;
    this.queryCalls = [];

    this.mutationsRun = 0;
    this.mutationCalls = [];
  };
  runQuery = (query, variables) => {
    if (this.generateResponse) {
      this.nextResult = this.generateResponse(query, variables);
    } else if (this.justWait) {
      return new Promise(() => null);
    }
    this.queriesRun++;
    this.queryCalls.push([query, variables]);
    return this.nextResult || {};
  };
  runMutation = (mutation, variables) => {
    this.mutationsRun++;
    this.mutationCalls.push([mutation, variables]);
    return this.nextMutationResult || {};
  };
}
