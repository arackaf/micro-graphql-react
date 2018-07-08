const deConstructMutationPacket = packet => {
  if (typeof packet === "string") {
    return [packet, null];
  } else if (Array.isArray(packet)) {
    return [packet[0], packet[1] || null];
  }
};

export default class MutationManager {
  runMutation = variables => {
    this.setState({
      running: true,
      finished: false
    });

    return this.client.processMutation(this.mutation, variables).then(resp => {
      this.setState({
        running: false,
        finished: true
      });
      return resp;
    });
  };
  currentState = {
    running: false,
    finished: false,
    runMutation: this.runMutation
  };
  updateState = (newState = {}) => {
    Object.assign(this.currentState, newState);
    this.setState(this.currentState);
  };
  constructor({ client, setState }, packet) {
    const [mutation, options] = deConstructMutationPacket(packet);
    this.client = client;
    this.setState = setState;
    this.mutation = mutation;
  }
}