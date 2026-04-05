import { App, TFile } from "obsidian";
import { ZkSettings } from "./zkSettings";
import { getMdFiles } from "./vaultQuery";

function tempFolderPath(settings: ZkSettings): string {
  return settings.tempRootPath.substring(0, settings.tempRootPath.lastIndexOf("/"));
}

// 腐敗しているTempノートを返す（ルートノート自身は除外）
export function detectDecayedNotes(app: App, settings: ZkSettings): TFile[] {
  const folderPath = tempFolderPath(settings);
  const rootPath = settings.tempRootPath;
  const thresholdMs = settings.decayDays * 24 * 60 * 60 * 1000;
  const now = Date.now();

  return getMdFiles(app, folderPath).filter((file) => {
    if (file.path === rootPath) return false; // ルートノートは除外
    // フロントマターのcreatedを優先。なければctime（ファイル作成日時）を使う
    const fm = app.metadataCache.getFileCache(file)?.frontmatter;
    const created = fm?.created;
    const baseTime = created ? new Date(String(created)).getTime() : file.stat.ctime;
    return now - baseTime > thresholdMs;
  });
}

const DECAY_START = "<!-- DECAY_START -->";
const DECAY_END = "<!-- DECAY_END -->";

function getBaseTime(app: App, file: TFile): number {
  const fm = app.metadataCache.getFileCache(file)?.frontmatter;
  const created = fm?.created;
  return created ? new Date(String(created)).getTime() : file.stat.ctime;
}

function buildDecaySection(decayedFiles: TFile[], app: App): string {
  if (decayedFiles.length === 0) {
    return `${DECAY_START}\n${DECAY_END}`;
  }
  const now = Date.now();
  const links = decayedFiles
    .sort((a, b) => getBaseTime(app, a) - getBaseTime(app, b)) // 古いものを上に
    .map((f) => {
      const days = Math.floor((now - getBaseTime(app, f)) / (24 * 60 * 60 * 1000));
      return `- [[${f.basename}]] (${days}日経過)`;
    })
    .join("\n");
  return `${DECAY_START}\n${links}\n${DECAY_END}`;
}

// Tempルートノートの腐敗リストを更新する
export async function updateDecayList(
  app: App,
  settings: ZkSettings
): Promise<void> {
  const rootFile = app.vault.getFileByPath(settings.tempRootPath);
  if (!rootFile) return;

  const decayedFiles = detectDecayedNotes(app, settings);
  const section = buildDecaySection(decayedFiles, app);
  const content = await app.vault.read(rootFile);

  let newContent: string;
  if (content.includes(DECAY_START)) {
    // 既存のセクションを置換
    newContent = content.replace(
      new RegExp(`${DECAY_START}[\\s\\S]*?${DECAY_END}`),
      section
    );
  } else {
    // セクションを末尾に追加
    newContent = `${content.trimEnd()}\n\n## 腐敗ノート（自動更新）\n${section}`;
  }

  if (newContent !== content) {
    await app.vault.modify(rootFile, newContent);
  }
}
