import { useQuery, buildQuery } from "../../src/index";

export const useHardResetQuery = (type, query, variables, options = {}) =>
  useQuery(
    buildQuery(query, variables, {
      ...options,
      onMutation: {
        when: new RegExp(`(update|create|delete)${type}s?`),
        run: ({ hardReset }) => hardReset()
      }
    })
  );
  
export const useBookHardResetQuery = (...args) => useHardResetQuery("Book", ...args);
export const useSubjectHardResetQuery = (...args) => useHardResetQuery("Subject", ...args);
