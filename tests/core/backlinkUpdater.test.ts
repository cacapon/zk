import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  isInCoreOrRef,
  getBacklinkFiles,
  buildBacklinkSection,
  updateBacklinksOnSave,
} from "../../src/core/backlinkUpdater";
import { DEFAULT_SETTINGS } from "../../src/core/zkSettings";
import { TFile } from "../../tests/__mocks__/obsidian";

const settings = {
  ...DEFAULT_SETTINGS,
  coreRootPath: "Core/Core.md",
  refRootPath: "Ref/Ref.md",
};

function fakeFile(path: string, mtime = 1000): TFile {
  return new TFile(path, mtime);
}

// =========================================================
// isInCoreOrRef
// =========================================================

describe("isInCoreOrRef", () => {
  test("Coreフォルダ内のパスはtrueを返す", () => {
    expect(isInCoreOrRef("Core/someNote.md", settings)).toBe(true);
  });

  test("Refフォルダ内のパスはtrueを返す", () => {
    expect(isInCoreOrRef("Ref/someNote.md", settings)).toBe(true);
  });

  test("どちらでもないパスはfalseを返す", () => {
    expect(isInCoreOrRef("Temp/note.md", settings)).toBe(false);
    expect(isInCoreOrRef("Other/note.md", settings)).toBe(false);
  });

  test("フォルダ名の前方一致では誤判定しない", () => {
    expect(isInCoreOrRef("CoreExtra/note.md", settings)).toBe(false);
  });
});

// =========================================================
// getBacklinkFiles
// =========================================================

describe("getBacklinkFiles", () => {
  test("通常リンク [[]] を持つファイルを返す", () => {
    const target = fakeFile("Core/target.md");
    const source = fakeFile("Core/source.md");

    const app = {
      metadataCache: {
        resolvedLinks: { "Core/source.md": { "Core/target.md": 1 } },
        getFileCache: vi.fn().mockReturnValue({
          links: [{ link: "target" }],
        }),
        getFirstLinkpathDest: vi.fn().mockReturnValue(target),
      },
      vault: {
        getFileByPath: vi.fn().mockImplementation((p: string) =>
          p === "Core/source.md" ? source : null
        ),
      },
    };

    const result = getBacklinkFiles(app as any, target as any);
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe("Core/source.md");
  });

  test("埋め込みリンク ![[]] しか持たないファイルは除外される", () => {
    const target = fakeFile("Core/target.md");
    const source = fakeFile("Core/source.md");

    const app = {
      metadataCache: {
        resolvedLinks: { "Core/source.md": { "Core/target.md": 1 } },
        // links がない（embeds のみ）
        getFileCache: vi.fn().mockReturnValue({ embeds: [{ link: "target" }] }),
        getFirstLinkpathDest: vi.fn(),
      },
      vault: {
        getFileByPath: vi.fn().mockReturnValue(source),
      },
    };

    const result = getBacklinkFiles(app as any, target as any);
    expect(result).toHaveLength(0);
  });

  test("自分自身はバックリンクに含まれない", () => {
    const target = fakeFile("Core/target.md");

    const app = {
      metadataCache: {
        resolvedLinks: { "Core/target.md": { "Core/target.md": 1 } },
        getFileCache: vi.fn().mockReturnValue({ links: [{ link: "target" }] }),
        getFirstLinkpathDest: vi.fn().mockReturnValue(target),
      },
      vault: {
        getFileByPath: vi.fn().mockReturnValue(target),
      },
    };

    const result = getBacklinkFiles(app as any, target as any);
    expect(result).toHaveLength(0);
  });

  test("更新日時の新しい順に並ぶ", () => {
    const target = fakeFile("Core/target.md");
    const older = fakeFile("Core/older.md", 1000);
    const newer = fakeFile("Core/newer.md", 9000);

    const app = {
      metadataCache: {
        resolvedLinks: {
          "Core/older.md": { "Core/target.md": 1 },
          "Core/newer.md": { "Core/target.md": 1 },
        },
        getFileCache: vi.fn().mockReturnValue({ links: [{ link: "target" }] }),
        getFirstLinkpathDest: vi.fn().mockReturnValue(target),
      },
      vault: {
        getFileByPath: vi.fn().mockImplementation((p: string) => {
          if (p === "Core/older.md") return older;
          if (p === "Core/newer.md") return newer;
          return null;
        }),
      },
    };

    const result = getBacklinkFiles(app as any, target as any);
    expect(result[0].path).toBe("Core/newer.md");
    expect(result[1].path).toBe("Core/older.md");
  });
});

// =========================================================
// buildBacklinkSection
// =========================================================

describe("buildBacklinkSection", () => {
  test("バックリンクがない場合は空のブロックを返す", () => {
    const app = { metadataCache: { getFileCache: vi.fn().mockReturnValue(null) } };
    const result = buildBacklinkSection([], app as any);
    expect(result).toBe("<!-- ZK_BACKLINKS_START -->\n<!-- ZK_BACKLINKS_END -->");
  });

  test("ファイル名を [[basename]] 形式でリスト化する", () => {
    const file = fakeFile("Core/note.md");
    const app = { metadataCache: { getFileCache: vi.fn().mockReturnValue({}) } };
    const result = buildBacklinkSection([file as any], app as any);
    expect(result).toContain("- [[note]]");
  });

  test("エイリアスがある場合は [[basename|alias]] 形式にする", () => {
    const file = fakeFile("Core/note.md");
    const app = {
      metadataCache: {
        getFileCache: vi.fn().mockReturnValue({
          frontmatter: { aliases: ["Cnot"] },
        }),
      },
    };
    const result = buildBacklinkSection([file as any], app as any);
    expect(result).toContain("- [[note|Cnot]]");
  });
});

// =========================================================
// updateBacklinksOnSave
// =========================================================

describe("updateBacklinksOnSave", () => {
  beforeEach(() => vi.clearAllMocks());

  test("リンク先のCore/Refノートのバックリンクセクションを更新する", async () => {
    const changedFile = fakeFile("Temp/memo.md");
    const targetFile = fakeFile("Core/note.md");

    const initialContent = `# note\n\n%%\n## Backlinks (auto)\n<!-- ZK_BACKLINKS_START -->\n<!-- ZK_BACKLINKS_END -->\n%%`;
    let written = "";

    const app = {
      metadataCache: {
        resolvedLinks: { "Temp/memo.md": { "Core/note.md": 1 } },
        getFileCache: vi.fn().mockReturnValue({ links: [{ link: "note" }] }),
        getFirstLinkpathDest: vi.fn().mockReturnValue(targetFile),
      },
      vault: {
        getFileByPath: vi.fn().mockImplementation((p: string) => {
          if (p === "Core/note.md") return targetFile;
          if (p === "Temp/memo.md") return changedFile;
          return null;
        }),
        read: vi.fn().mockResolvedValue(initialContent),
        modify: vi.fn().mockImplementation((_f: any, c: string) => { written = c; }),
      },
    };

    await updateBacklinksOnSave(app as any, settings, changedFile as any, new Set());

    expect(app.vault.modify).toHaveBeenCalledOnce();
    expect(written).toContain("[[memo]]");
  });

  test("changedFile 自身が Core/Ref の場合、自身のバックリンクも更新する", async () => {
    const changedFile = fakeFile("Core/self.md");
    const linkedFrom = fakeFile("Core/other.md");

    const initialContent = `%%\n<!-- ZK_BACKLINKS_START -->\n<!-- ZK_BACKLINKS_END -->\n%%`;
    let written = "";

    const app = {
      metadataCache: {
        resolvedLinks: {
          "Core/self.md": {},
          "Core/other.md": { "Core/self.md": 1 },
        },
        getFileCache: vi.fn().mockReturnValue({ links: [{ link: "self" }] }),
        getFirstLinkpathDest: vi.fn().mockReturnValue(changedFile),
      },
      vault: {
        getFileByPath: vi.fn().mockImplementation((p: string) => {
          if (p === "Core/self.md") return changedFile;
          if (p === "Core/other.md") return linkedFrom;
          return null;
        }),
        read: vi.fn().mockResolvedValue(initialContent),
        modify: vi.fn().mockImplementation((_f: any, c: string) => { written = c; }),
      },
    };

    await updateBacklinksOnSave(app as any, settings, changedFile as any, new Set());

    expect(app.vault.modify).toHaveBeenCalledOnce();
    expect(written).toContain("[[other]]");
  });

  test("skipPaths に含まれるパスはスキップされる", async () => {
    const changedFile = fakeFile("Temp/memo.md");
    const targetFile = fakeFile("Core/note.md");

    const app = {
      metadataCache: {
        resolvedLinks: { "Temp/memo.md": { "Core/note.md": 1 } },
        getFileCache: vi.fn(),
        getFirstLinkpathDest: vi.fn(),
      },
      vault: {
        getFileByPath: vi.fn().mockReturnValue(targetFile),
        read: vi.fn(),
        modify: vi.fn(),
      },
    };

    const skipPaths = new Set(["Core/note.md"]);
    await updateBacklinksOnSave(app as any, settings, changedFile as any, skipPaths);

    expect(app.vault.modify).not.toHaveBeenCalled();
  });

  test("Core/Refノート以外へのリンクは無視する", async () => {
    const changedFile = fakeFile("Core/note.md");

    const app = {
      metadataCache: {
        resolvedLinks: { "Core/note.md": { "Temp/tmp.md": 1 } },
        getFileCache: vi.fn().mockReturnValue({}),
        getFirstLinkpathDest: vi.fn(),
      },
      vault: {
        getFileByPath: vi.fn().mockReturnValue(fakeFile("Core/note.md")),
        read: vi.fn().mockResolvedValue("no backlinks block"),
        modify: vi.fn(),
      },
    };

    await updateBacklinksOnSave(app as any, settings, changedFile as any, new Set());

    expect(app.vault.modify).not.toHaveBeenCalled();
  });

  test("ZK_BACKLINKSブロックがないノートは変更しない", async () => {
    const changedFile = fakeFile("Temp/memo.md");
    const targetFile = fakeFile("Core/note.md");

    const app = {
      metadataCache: {
        resolvedLinks: { "Temp/memo.md": { "Core/note.md": 1 } },
        getFileCache: vi.fn().mockReturnValue({ links: [{ link: "note" }] }),
        getFirstLinkpathDest: vi.fn().mockReturnValue(targetFile),
      },
      vault: {
        getFileByPath: vi.fn().mockReturnValue(targetFile),
        read: vi.fn().mockResolvedValue("# note\n\nバックリンクブロックなし"),
        modify: vi.fn(),
      },
    };

    await updateBacklinksOnSave(app as any, settings, changedFile as any, new Set());

    expect(app.vault.modify).not.toHaveBeenCalled();
  });

  test("内容に変化がない場合はmodifyを呼ばない", async () => {
    const changedFile = fakeFile("Temp/memo.md");
    const targetFile = fakeFile("Core/note.md");

    // バックリンクなし、かつ既にDECAY_STARTブロックが空の状態
    const content = "<!-- ZK_BACKLINKS_START -->\n<!-- ZK_BACKLINKS_END -->";

    const app = {
      metadataCache: {
        resolvedLinks: { "Temp/memo.md": { "Core/note.md": 1 } },
        // リンクはあるがresolveLinkが null → バックリンクなしと同等
        getFileCache: vi.fn().mockReturnValue({ links: [{ link: "note" }] }),
        getFirstLinkpathDest: vi.fn().mockReturnValue(null),
      },
      vault: {
        getFileByPath: vi.fn().mockReturnValue(targetFile),
        read: vi.fn().mockResolvedValue(content),
        modify: vi.fn(),
      },
    };

    await updateBacklinksOnSave(app as any, settings, changedFile as any, new Set());

    expect(app.vault.modify).not.toHaveBeenCalled();
  });
});
