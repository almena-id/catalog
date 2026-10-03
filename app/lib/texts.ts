/** A text the API serves by language (`{en, es}`). */
export type Labels = Record<string, string | undefined>;

/** The text in the visitor's language, else English, else whichever there is. */
export function label(labels: Labels, locale: string): string {
  return labels[locale] || labels.en || Object.values(labels).find(Boolean) || "";
}

/** Texts by language, as the API keeps a form's name, help and purposes. */
export type Texts = Partial<Record<string, string>>;

/** Whether any language has text. */
export function hasText(value: Texts | undefined | null): boolean {
  return Object.values(value ?? {}).some((text) => text?.trim());
}
