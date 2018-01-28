import compress from "graphql-query-compress";

export default class Client {
  constructor(props) {
    Object.assign(this, props);
  }
  run(query, variables) {
    return fetch(
      `${this.endpoint}?query=${encodeURIComponent(compress(query))}${
        typeof variables === "object" ? `&variables=${JSON.stringify(variables)}` : ""
      }`,
      this.fetchOptions || void 0
    ).then(resp => resp.json());
  }
}
