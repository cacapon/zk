import { describe, test, expect, vi, beforeEach } from "vitest";
import { detectDecayedNotes, updateDecayList } from "../../src/core/decayDetector";
import { DEFAULT_SETTINGS } from "../../src/core/zkSettings";
import * as vaultQuery from "../../src/core/vaultQuery";

vi.mock("../../src/core/vaultQuery", () => ({
  getMdFiles: vi.fn(),
}));

const settings = {
  ...DEFAULT_SETTINGS,
  tempRootPath: "Temp/Temp.md",
  decayDays: 14,
};

const DAY_MS = 24 * 60 * 60 * 1000;

function fakeFile(path: string, ageMs: number) {
  const t = Date.now() - ageMs;
  return {
    path,
    basename: path.split("/").pop()!.replace(".md", ""),
    stat: { mtime: t, ctime: t },
  };
}

// createdフロントマターなし（ctimeにフォールバック）のappモック
function fakeAppNoFrontmatter() {
  return {
    metadataCache: {
      getFileCache: vi.fn().mockReturnValue(null),
    },
  };
}

describe("detectDecayedNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("腐敗日数を超えたノートを返す", () => {
    vi.mocked(vaultQuery.getMdFiles).mockReturnValue([
      fakeFile("Temp/old.md", 15 * DAY_MS),
    ] as any);

    const result = detectDecayedNotes(fakeAppNoFrontmatter() as any, settings);
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe("Temp/old.md");
  });

  test("腐敗日数以内のノートは返さない", () => {
    vi.mocked(vaultQuery.getMdFiles).mockReturnValue([
      fakeFile("Temp/new.md", 5 * DAY_MS),
    ] as any);

    const result = detectDecayedNotes(fakeAppNoFrontmatter() as any, settings);
    expect(result).toHaveLength(0);
  });

  test("ルートノートは腐敗していても除外される", () => {
    vi.mocked(vaultQuery.getMdFiles).mockReturnValue([
      fakeFile("Temp/Temp.md", 30 * DAY_MS),
    ] as any);

    const result = detectDecayedNotes(fakeAppNoFrontmatter() as any, settings);
    expect(result).toHaveLength(0);
  });

  test("腐敗・正常・ルートが混在する場合、腐敗ノートのみ返す", () => {
    vi.mocked(vaultQuery.getMdFiles).mockReturnValue([
      fakeFile("Temp/old.md", 15 * DAY_MS),
      fakeFile("Temp/new.md", 5 * DAY_MS),
      fakeFile("Temp/Temp.md", 30 * DAY_MS),
    ] as any);

    const result = detectDecayedNotes(fakeAppNoFrontmatter() as any, settings);
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe("Temp/old.md");
  });

  test("ノートがない場合は空配列を返す", () => {
    vi.mocked(vaultQuery.getMdFiles).mockReturnValue([]);

    const result = detectDecayedNotes(fakeAppNoFrontmatter() as any, settings);
    expect(result).toHaveLength(0);
  });

  test("decayDays: 1 のとき、1日超えたノートのみ返す", () => {
    const s = { ...settings, decayDays: 1 };
    vi.mocked(vaultQuery.getMdFiles).mockReturnValue([
      fakeFile("Temp/justOver.md", 25 * 60 * 60 * 1000), // 25時間
      fakeFile("Temp/fresh.md", 30 * 60 * 1000),          // 30分
    ] as any);

    const result = detectDecayedNotes(fakeAppNoFrontmatter() as any, s);
    expect(result).toHaveLength(1);
    expect(result[0].path).toBe("Temp/justOver.md");
  });

  test("フロントマターのcreatedがある場合はそれを基準にする", () => {
    const app = {
      metadataCache: {
        getFileCache: vi.fn().mockReturnValue({
          frontmatter: { created: new Date(Date.now() - 20 * DAY_MS).toISOString().split("T")[0] },
        }),
      },
    };
    // mtimeは直近（腐敗していない）だが、createdは20日前（腐敗している）
    vi.mocked(vaultQuery.getMdFiles).mockReturnValue([
      { path: "Temp/note.md", basename: "note", stat: { mtime: Date.now(), ctime: Date.now() } },
    ] as any);

    const result = detectDecayedNotes(app as any, settings);
    expect(result).toHaveLength(1);
  });
});

describe("updateDecayList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function fakeUpdateApp(
    rootContent: string,
    decayedFiles: ReturnType<typeof fakeFile>[] = []
  ) {
    const rootFile = { path: "Temp/Temp.md", basename: "Temp" };
    let written = "";
    const app = {
      metadataCache: {
        getFileCache: vi.fn().mockReturnValue(null),
      },
      vault: {
        getFileByPath: vi.fn().mockReturnValue(rootFile),
        read: vi.fn().mockResolvedValue(rootContent),
        modify: vi.fn().mockImplementation((_f: any, c: string) => { written = c; }),
      },
    };
    vi.mocked(vaultQuery.getMdFiles).mockReturnValue(decayedFiles as any);
    return { app, getWritten: () => written };
  }

  test("ルートノートが存在しない場合は何もしない", async () => {
    const app = {
      metadataCache: { getFileCache: vi.fn().mockReturnValue(null) },
      vault: {
        getFileByPath: vi.fn().mockReturnValue(null),
        read: vi.fn(),
        modify: vi.fn(),
      },
    };
    vi.mocked(vaultQuery.getMdFiles).mockReturnValue([]);

    await updateDecayList(app as any, settings);
    expect(app.vault.modify).not.toHaveBeenCalled();
  });

  test("DECAY_STARTブロックがない場合は末尾に追加する", async () => {
    const { app, getWritten } = fakeUpdateApp("# Temp\n\n初期内容");
    await updateDecayList(app as any, settings);
    expect(getWritten()).toContain("<!-- DECAY_START -->");
    expect(getWritten()).toContain("<!-- DECAY_END -->");
    expect(getWritten()).toContain("## 腐敗ノート（自動更新）");
  });

  test("既存のDECAY_STARTブロックを置換する", async () => {
    const initial = "# Temp\n\n## 腐敗ノート（自動更新）\n<!-- DECAY_START -->\n- [[old]]\n<!-- DECAY_END -->";
    const { app, getWritten } = fakeUpdateApp(initial);
    await updateDecayList(app as any, settings);
    expect(getWritten()).not.toContain("- [[old]]");
    expect(getWritten()).toContain("<!-- DECAY_START -->");
  });

  test("腐敗ノートが存在する場合、そのリンクが書き込まれる", async () => {
    const { app, getWritten } = fakeUpdateApp(
      "# Temp\n\n<!-- DECAY_START -->\n<!-- DECAY_END -->",
      [fakeFile("Temp/old.md", 15 * DAY_MS)]
    );
    await updateDecayList(app as any, settings);
    expect(getWritten()).toContain("[[old]]");
  });

  test("腐敗ノートに経過日数が表示される", async () => {
    const { app, getWritten } = fakeUpdateApp(
      "# Temp\n\n<!-- DECAY_START -->\n<!-- DECAY_END -->",
      [fakeFile("Temp/old.md", 15 * DAY_MS)]
    );
    await updateDecayList(app as any, settings);
    expect(getWritten()).toContain("[[old]] (15日経過)");
  });

  test("古いものから順に並ぶ", async () => {
    const { app, getWritten } = fakeUpdateApp(
      "<!-- DECAY_START -->\n<!-- DECAY_END -->",
      [fakeFile("Temp/newer.md", 20 * DAY_MS), fakeFile("Temp/older.md", 30 * DAY_MS)]
    );
    await updateDecayList(app as any, settings);
    const written = getWritten();
    expect(written.indexOf("[[older]]")).toBeLessThan(written.indexOf("[[newer]]"));
  });

  test("内容に変化がない場合はmodifyを呼ばない", async () => {
    const emptySection = "# Temp\n\n<!-- DECAY_START -->\n<!-- DECAY_END -->";
    const rootFile = { path: "Temp/Temp.md", basename: "Temp" };
    const app = {
      metadataCache: { getFileCache: vi.fn().mockReturnValue(null) },
      vault: {
        getFileByPath: vi.fn().mockReturnValue(rootFile),
        read: vi.fn().mockResolvedValue(emptySection),
        modify: vi.fn(),
      },
    };
    vi.mocked(vaultQuery.getMdFiles).mockReturnValue([]);

    await updateDecayList(app as any, settings);
    expect(app.vault.modify).not.toHaveBeenCalled();
  });
});
