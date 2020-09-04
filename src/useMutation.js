import React from "react";
const { useState, useRef, useMemo, useLayoutEffect } = React;

import { defaultClientManager } from "./client";
import MutationManager from "./mutationManager";

export default function useMutation(mutation, options = {}) {
  let [mutationState, setMutationState] = useState(null);

  let client = options.client || defaultClientManager.getDefaultClient();

  let [mutationManager] = useState(() => {
    return new MutationManager({ client, setState: setMutationState }, mutation, options);
  });

  useLayoutEffect(() => () => (mutationManager.setState = () => {}), []);

  return mutationState || mutationManager.currentState;
}
