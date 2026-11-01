/**
 * The initials an issuer is shown by (there are no logos): the first letter of
 * its first two words, else its first two letters.
 */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters =
    words.length > 1
      ? [words[0], words[1]].map((word) => Array.from(word)[0] ?? "")
      : Array.from(words[0] ?? "").slice(0, 2);
  return letters.join("").toLocaleUpperCase() || "?";
}
