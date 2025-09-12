// client/src/utils/format.ts
export function titleCase(slugOrWords: string) {
  return slugOrWords
    .replace(/-/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}
