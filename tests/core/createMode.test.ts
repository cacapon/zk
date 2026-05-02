import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMode } from "../../src/core/createMode";
import { ModeList } from "../../src/core/modeList";
import { FileSystem } from "../../src/core/fileSystem";

const makeFs = (existingPaths: string[] = []): FileSystem => ({
  exists: (path) => existingPaths.includes(path),
  createFolder: vi.fn(),
  createFile: vi.fn(),
});

describe("createMode", () => {
  let modeList: ModeList;

  beforeEach(() => {
    modeList = new ModeList();
  });

  it("正常に作成するとtrueを返す", async () => {
    const result = await createMode("Core", "/notes/Core", "/templates/Core.md", modeList, makeFs());
    expect(result).toBe(true);
  });

  it("同名モードが既にあるとfalseを返す", async () => {
    await createMode("Core", "/notes/Core", "/templates/Core.md", modeList, makeFs());
    const result = await createMode("Core", "/notes/Core", "/templates/Core.md", modeList, makeFs());
    expect(result).toBe(false);
  });

  it("作成後にModeListに追加される", async () => {
    await createMode("Core", "/notes/Core", "/templates/Core.md", modeList, makeFs());
    expect(modeList.getModes().map((m) => m.name)).toContain("Core");
  });

  it("currPathはrootノートのパスになる", async () => {
    await createMode("Core", "/notes/Core", "/templates/Core.md", modeList, makeFs());
    expect(modeList.getModes()[0].currPath).toBe("/notes/Core/Core.md");
  });

  it("rootノートが存在しない場合は空ファイルを作成する", async () => {
    const fs = makeFs();
    await createMode("Core", "/notes/Core", "/templates/Core.md", modeList, fs);
    expect(fs.createFile).toHaveBeenCalledWith("/notes/Core/Core.md", "");
  });

  it("rootノートが既に存在する場合はファイルを作成しない", async () => {
    const fs = makeFs(["/notes/Core/Core.md"]);
    await createMode("Core", "/notes/Core", "/templates/Core.md", modeList, fs);
    expect(fs.createFile).not.toHaveBeenCalledWith("/notes/Core/Core.md", "");
  });

  it("dirPathが存在しない場合はフォルダを作成する", async () => {
    const fs = makeFs();
    await createMode("Core", "/notes/Core", "/templates/Core.md", modeList, fs);
    expect(fs.createFolder).toHaveBeenCalledWith("/notes/Core");
  });

  it("dirPathが既に存在する場合はdirPathのフォルダを作成しない", async () => {
    const fs = makeFs(["/notes/Core"]);
    await createMode("Core", "/notes/Core", "/templates/Core.md", modeList, fs);
    expect(fs.createFolder).not.toHaveBeenCalledWith("/notes/Core");
  });

  it("tempPathの親フォルダが存在しない場合はフォルダを作成する", async () => {
    const fs = makeFs();
    await createMode("Core", "/notes/Core", "/templates/Core.md", modeList, fs);
    expect(fs.createFolder).toHaveBeenCalledWith("/templates");
  });

  it("tempPathの親フォルダが既に存在する場合はフォルダを作成しない", async () => {
    const fs = makeFs(["/templates"]);
    await createMode("Core", "/notes/Core", "/templates/Core.md", modeList, fs);
    expect(fs.createFolder).not.toHaveBeenCalledWith("/templates");
  });

  it("tempPathが存在しない場合は空ファイルを作成する", async () => {
    const fs = makeFs();
    await createMode("Core", "/notes/Core", "/templates/Core.md", modeList, fs);
    expect(fs.createFile).toHaveBeenCalledWith("/templates/Core.md", "");
  });

  it("tempPathが既に存在する場合はテンプレートファイルを作成しない", async () => {
    const fs = makeFs(["/templates/Core.md"]);
    await createMode("Core", "/notes/Core", "/templates/Core.md", modeList, fs);
    expect(fs.createFile).not.toHaveBeenCalledWith("/templates/Core.md", "");
  });
});
