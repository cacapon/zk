export interface CoreNoteParams {
  id: string;
  alias: string;
  parentTitle: string;
  createdDate: string;
}

export function buildCoreNote(params: CoreNoteParams): string {
  const { id, alias, parentTitle, createdDate } = params;
  return `---
created: ${createdDate}
id: "${id}"
aliases:
  - "${alias}"
tags:
---
↑: [[${parentTitle}]]

-
[[TODO]]

%%
## Backlinks (auto)
<!-- ZK_BACKLINKS_START -->
<!-- ZK_BACKLINKS_END -->
%%`;
}
