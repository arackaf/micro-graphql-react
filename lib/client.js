import compress from "graphql-query-compress";

export default class Client {
  constructor(props) {
    Object.assign(this, props);
  }
  run(query) {
    return fetch(`${this.endpoint}?query=${encodeURIComponent(compress(query))}`, this.fetchOptions || void 0).then(resp => resp.json());
  }
}
