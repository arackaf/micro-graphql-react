import React from "react";
import { defaultClientManager } from "./client";
import QueryManager from "./queryManager";

const useState = React.useState;

export default function useQuery(packet) {
  let [query, variables, options = {}] = packet;
  let client = options.client || defaultClientManager.getDefaultClient();

  let [queryState, setQueryState] = useState(QueryManager.initialState);
  let [queryManager] = useState(new QueryManager({ client, cache: options.cache, setState: setQueryState }, packet));

  return queryState;
}
