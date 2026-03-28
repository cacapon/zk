import { App, TFile } from "obsidian";
import { ZkSettings } from "./zkSettings";

const BL_START = "<!-- ZK_BACKLINKS_START -->";
const BL_END = "<!-- ZK_BACKLINKS_END -->";

function folderOf(rootPath: string): string {
  return rootPath.substring(0, rootPath.lastIndexOf("/"));
}

export function isInCoreOrRef(path: string, settings: ZkSettings): boolean {
  const coreFolder = folderOf(settings.coreRootPath);
  const refFolder = folderOf(settings.refRootPath);
  return (
    path === coreFolder || path.startsWith(coreFolder + "/") ||
    path === refFolder  || path.startsWith(refFolder + "/")
  );
}

// ファイルへの非埋め込み（通常の [[]] のみ）バックリンクを持つファイルを返す
// 並び順: 更新日時の新しい順
export function getBacklinkFiles(app: App, file: TFile): TFile[] {
  const result: TFile[] = [];

  for (const sourcePath of Object.keys(app.metadataCache.resolvedLinks)) {
    if (sourcePath === file.path) continue;

    const sourceFile = app.vault.getFileByPath(sourcePath);
    if (!(sourceFile instanceof TFile)) continue;

    // ![[]] 埋め込みを除外し、[[]] リンクのみ対象
    const links = app.metadataCache.getFileCache(sourceFile)?.links;
    if (!links) continue;

    const hasLink = links.some((link) => {
      const resolved = app.metadataCache.getFirstLinkpathDest(link.link, sourcePath);
      return resolved?.path === file.path;
    });

    if (hasLink) result.push(sourceFile);
  }

  return result.sort((a, b) => b.stat.mtime - a.stat.mtime);
}

export function buildBacklinkSection(backlinkFiles: TFile[], app: App): string {
  if (backlinkFiles.length === 0) {
    return `${BL_START}\n${BL_END}`;
  }

  const rows = backlinkFiles.map((f) => {
    const fm      = app.metadataCache.getFileCache(f)?.frontmatter;
    const aliases = fm?.aliases;
    const alias   = Array.isArray(aliases) ? (aliases[0] ?? "") : "";
    const created = fm?.created ?? "";
    const updated = new Date(f.stat.mtime).toISOString().split("T")[0];
    return `[[${f.basename}]] ${alias} ${created} ${updated}`;
  });

  return `${BL_START}\n${rows.join("\n")}\n${BL_END}`;
}

// 指定ノートのバックリンクセクションを現在の状態で書き直す
export async function updateBacklinksOf(app: App, file: TFile): Promise<void> {
  const content = await app.vault.read(file);
  if (!content.includes(BL_START)) return;

  const section = buildBacklinkSection(getBacklinkFiles(app, file), app);
  const newContent = content.replace(
    new RegExp(`${BL_START}[\\s\\S]*?${BL_END}`),
    section
  );

  if (newContent !== content) {
    await app.vault.modify(file, newContent);
  }
}
