import React from "react";
const { useState, useRef, useMemo } = React;

import { defaultClientManager } from "./client";
import MutationManager from "./mutationManager";

export default function useQuery(packet) {
  let [mutation, options = {}] = packet;
  let [mutationState, setMutationState] = useState(MutationManager.initialState);

  let client = options.client || defaultClientManager.getDefaultClient();
  let mutationManager = useMemo(() => {
    let mutationManager = new MutationManager({ client, setState: setMutationState }, packet);
    mutationManager.updateState();
    return mutationManager;
  }, []);

  return mutationState;
}
