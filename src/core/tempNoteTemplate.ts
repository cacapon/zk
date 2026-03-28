export function buildTempNote(createdDate: string): string {
  return `---
created: ${createdDate}
---

-`;
}
