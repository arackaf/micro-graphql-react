export default class MutationManager {
  runMutation = variables => {
    this.setState({
      running: true,
      finished: false,
      runMutation: this.runMutation
    });

    return this.client.processMutation(this.mutation, variables).then(resp => {
      this.setState({
        running: false,
        finished: true,
        runMutation: this.runMutation
      });
      return resp;
    });
  };
  static initialState = {
    running: false,
    finished: false
  };
  currentState = {
    ...MutationManager.initialState,
    runMutation: this.runMutation
  };

  constructor({ client, setState }, mutation, options) {
    this.client = client;
    this.setState = setState;
    this.mutation = mutation;

    this.setState(this.currentState);
  }
}
