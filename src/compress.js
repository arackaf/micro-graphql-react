module.exports = function compress(strings, ...expressions) {
  return strings
    .map((string, i) => {
      const expression = i < expressions.length ? expressions[i] : "";
      return string.replace(/\s+/g, " ") + expression;
    })
    .join("")
    .trim();
};
