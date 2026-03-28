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
    return now - file.stat.mtime > thresholdMs;
  });
}

const DECAY_START = "<!-- DECAY_START -->";
const DECAY_END = "<!-- DECAY_END -->";

function buildDecaySection(decayedFiles: TFile[]): string {
  if (decayedFiles.length === 0) {
    return `${DECAY_START}\n${DECAY_END}`;
  }
  const links = decayedFiles
    .sort((a, b) => a.stat.mtime - b.stat.mtime) // 古いものを上に
    .map((f) => `- [[${f.basename}]]`)
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
  const section = buildDecaySection(decayedFiles);
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
