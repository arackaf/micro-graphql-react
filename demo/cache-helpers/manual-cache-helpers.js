import { getDefaultClient } from "../../src/index";

const graphQLClient = getDefaultClient();

const syncCollection = (current, newResultsLookup) => {
  return current.map(item => {
    const updatedItem = newResultsLookup.get(item._id);
    return updatedItem ? Object.assign({}, item, updatedItem) : item;
  });
};

export const syncQueryToCache = (query, type) => {
  graphQLClient.subscribeMutation([
    {
      when: new RegExp(`update${type}s?`),
      run: ({ refreshActiveQueries }, resp, variables) => {
        const cache = graphQLClient.getCache(query);
        const newResults = resp[`update${type}`] ? [resp[`update${type}`][type]] : resp[`update${type}s`][`${type}s`];
        const newResultsLookup = new Map(newResults.map(item => [item._id, item]));

        for (let [uri, { data }] of cache.entries) {
          data[`all${type}s`][`${type}s`] = syncCollection(data[`all${type}s`][`${type}s`], newResultsLookup);
        }

        refreshActiveQueries(query);
      }
    }
  ]);
};
