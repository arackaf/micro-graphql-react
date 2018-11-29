const deConstructMutationPacket = packet => {
  if (typeof packet === "string") {
    return [packet];
  } else if (Array.isArray(packet)) {
    return [packet[0]];
  }
};

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
  updateState = (newState = {}) => {
    Object.assign(this.currentState, newState);
    this.setState(this.currentState);
  };
  constructor({ client, setState }, packet) {
    const [mutation] = deConstructMutationPacket(packet);
    this.client = client;
    this.setState = setState;
    this.mutation = mutation;
  }
}
