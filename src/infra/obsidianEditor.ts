import { Workspace } from "obsidian";
import { Editor } from "../core/editor";
import { parseLinkAtCursor } from "../core/linkParser";

export class ObsidianEditor implements Editor {
  constructor(private workspace: Workspace) {}

  async openNote(path: string): Promise<void> {
    const sourcePath = this.workspace.getActiveFile()?.path ?? "";
    await this.workspace.openLinkText(path, sourcePath, false);
  }

  getSelection(): string | null {
    const selection = this.workspace.activeEditor?.editor?.getSelection();
    return selection || null;
  }

  replaceSelection(text: string): void {
    this.workspace.activeEditor?.editor?.replaceSelection(text);
  }

  getActiveFilePath(): string | null {
    return this.workspace.getActiveFile()?.path ?? null;
  }

  getCursorLinkTarget(): string | null {
    const editor = this.workspace.activeEditor?.editor;
    if (!editor) return null;
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    return parseLinkAtCursor(line, cursor.ch);
  }
}
