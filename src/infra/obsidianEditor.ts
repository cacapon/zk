import { Workspace } from "obsidian";
import { Editor } from "../core/editor";

export class ObsidianEditor implements Editor {
  constructor(private workspace: Workspace) {}

  async openNote(path: string): Promise<void> {
    await this.workspace.openLinkText(path, "", true);
  }
}
