export default function compress(strings, ...expressions) {
  return strings
    .map((string, i) => {
      const expression = i < expressions.length ? expressions[i] : "";
      return (
        string
          .replace(/\s+/g, " ")
          .replace(/{ /g, "{")
          .replace(/} /g, "}")
          .replace(/ {/g, "{")
          .replace(/ }/g, "}")
          .replace(/ \(/g, "(")
          .replace(/\) /g, ")") + expression
      );
    })
    .join("")
    .trim();
}
