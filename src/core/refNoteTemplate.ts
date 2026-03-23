export interface RefNoteParams {
  id: string;
  alias: string;
  srcTitle: string;
  createdDate: string;
}

export function buildRefNote(params: RefNoteParams): string {
  const { id, alias, srcTitle, createdDate } = params;
  return `---
created: ${createdDate}
id: "${id}"
aliases:
  - "${alias}"
tags:
src: "[[${srcTitle}]]"
page:
---
↑: [[${srcTitle}]]

-

%%
## Backlinks (auto)
<!-- ZK_BACKLINKS_START -->
<!-- ZK_BACKLINKS_END -->
%%`;
}
