export function buildTempNote(createdDate: string, rootName: string): string {
  return `---
created: ${createdDate}
---
↑: [[${rootName}]]

-`;
}
