import { describe, it, expect, beforeEach, vi } from "vitest";
import { openOrCreateZettel } from "../../src/core/openOrCreateZettel";
import { ModeList } from "../../src/core/modeList";
import { FileSystem } from "../../src/core/fileSystem";
import { Editor } from "../../src/core/editor";
import { Mode } from "../../src/core/mode";

const mode: Mode = {
  name: "Core",
  dirPath: "/notes/Core",
  tempPath: "/templates/Core.md",
  currPath: "/notes/Core/Core.md",
};

const makeFs = (existingPaths: string[] = []): FileSystem => ({
  exists: (path) => existingPaths.includes(path),
  createFolder: vi.fn(),
  createFile: vi.fn(),
});

const makeEditor = (): Editor => ({
  openNote: vi.fn(),
  getSelection: vi.fn(),
  replaceSelection: vi.fn(),
});

describe("openOrCreateZettel", () => {
  let modeList: ModeList;

  beforeEach(() => {
    modeList = new ModeList();
    modeList.addMode(mode);
  });

  it("ノートが存在しない場合は作成する", async () => {
    const fs = makeFs();
    await openOrCreateZettel("NewNote", mode, modeList, fs, makeEditor());
    expect(fs.createFile).toHaveBeenCalledWith("/notes/Core/NewNote.md", "");
  });

  it("ノートが既に存在する場合は作成しない", async () => {
    const fs = makeFs(["/notes/Core/NewNote.md"]);
    await openOrCreateZettel("NewNote", mode, modeList, fs, makeEditor());
    expect(fs.createFile).not.toHaveBeenCalled();
  });

  it("currPathが更新される", async () => {
    await openOrCreateZettel("NewNote", mode, modeList, makeFs(), makeEditor());
    expect(modeList.getModes()[0].currPath).toBe("/notes/Core/NewNote.md");
  });

  it("editor.openNoteが呼ばれる", async () => {
    const editor = makeEditor();
    await openOrCreateZettel("NewNote", mode, modeList, makeFs(), editor);
    expect(editor.openNote).toHaveBeenCalledWith("/notes/Core/NewNote.md");
  });
});
