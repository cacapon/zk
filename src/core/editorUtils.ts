import { Editor } from "obsidian";

export interface LinkAtCursor {
  target: string;
  alias: string | null;
}

// カーソル位置が [[...]] の内側にあれば { target, alias } を返す
export function getLinkAtCursor(editor: Editor): LinkAtCursor | null {
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);
  const regex = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;
    if (cursor.ch >= start && cursor.ch <= end) {
      const parts = match[1].trim().split("|");
      return {
        target: parts[0].trim(),
        alias: parts[1] ? parts[1].trim() : null,
      };
    }
  }
  return null;
}
