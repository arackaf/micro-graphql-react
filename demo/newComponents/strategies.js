export const hardResetStrategy = name => ({
  when: new RegExp(`(update|create|delete)${name}s?`),
  run: ({ hardReset }) => hardReset()
});

export const standardUpdateSingleStrategy = name => ({
  when: `update${name}`,
  run: ({ softReset, currentResults }, { [`update${name}`]: { [name]: updatedItem } }) => {
    let CachedItem = currentResults[`all${name}s`][`${name}s`].find(x => x._id == updatedItem._id);
    CachedItem && Object.assign(CachedItem, updatedItem);
    softReset(currentResults);
  }
});
