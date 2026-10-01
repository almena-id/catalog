/** A text the API serves by language (`{en, es}`). */
export type Labels = Record<string, string | undefined>;

/** The text in the visitor's language, else English, else whichever there is. */
export function label(labels: Labels, locale: string): string {
  return labels[locale] || labels.en || Object.values(labels).find(Boolean) || "";
}
