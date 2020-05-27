import { useQuery } from "../../src/index";

export const useSoftResetQuery = (type, query, variables, options = {}) =>
  useQuery(query, variables, {
    ...options,
    onMutation: {
      when: new RegExp(`update${type}s?`),
      run: ({ softReset, currentResults }, resp) => {
        const updatedItems = resp[`update${type}s`]?.[`${type}s`] ?? [resp[`update${type}`][type]];
        updatedItems.forEach(updatedItem => {
          let CachedItem = currentResults[`all${type}s`][`${type}s`].find(item => item._id == updatedItem._id);
          CachedItem && Object.assign(CachedItem, updatedItem);
        });
        softReset(currentResults);
      }
    },
  });

export const useBookSoftResetQuery = (...args) => useSoftResetQuery("Book", ...args);
export const useSubjectSoftResetQuery = (...args) => useSoftResetQuery("Subject", ...args);
