export const hardResetStrategy = name => ({
  when: new RegExp(`(update|create|delete)${name}s?`),
  run: ({ hardReset }) => hardReset()
});
