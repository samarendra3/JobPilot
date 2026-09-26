/**
 * Escapes user-supplied search text for safe use inside a MongoDB regex
 * filter, so characters like `.`, `*`, `(`, `|`, etc. are matched
 * literally instead of being interpreted as regex syntax.
 */
export function toSafeSearchRegex(search: string): RegExp {
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escaped, "i");
}
