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

  const lines = backlinkFiles.map((f) => {
    const aliases = app.metadataCache.getFileCache(f)?.frontmatter?.aliases;
    const alias = Array.isArray(aliases) ? aliases[0] : undefined;
    return alias ? `- [[${f.basename}|${alias}]]` : `- [[${f.basename}]]`;
  });

  return `${BL_START}\n${lines.join("\n")}\n${BL_END}`;
}

async function rewriteBacklinks(app: App, targetFile: TFile): Promise<void> {
  const content = await app.vault.read(targetFile);
  if (!content.includes(BL_START)) return;

  const section = buildBacklinkSection(getBacklinkFiles(app, targetFile), app);
  const newContent = content.replace(
    new RegExp(`${BL_START}[\\s\\S]*?${BL_END}`),
    section
  );

  if (newContent !== content) {
    await app.vault.modify(targetFile, newContent);
  }
}

// ファイル保存時に関連する Core/Ref ノートのバックリンクを更新する
// skipPaths: 現在更新中のパスセット（無限ループ防止）
export async function updateBacklinksOnSave(
  app: App,
  settings: ZkSettings,
  changedFile: TFile,
  skipPaths: Set<string>
): Promise<void> {
  // 更新対象: changedFile のアウトゴーイングリンク先 Core/Ref + changedFile 自身（Core/Ref の場合）
  const targets = new Set<string>();

  const outgoing = app.metadataCache.resolvedLinks[changedFile.path] ?? {};
  for (const targetPath of Object.keys(outgoing)) {
    if (isInCoreOrRef(targetPath, settings)) targets.add(targetPath);
  }

  if (isInCoreOrRef(changedFile.path, settings)) targets.add(changedFile.path);

  for (const targetPath of targets) {
    if (skipPaths.has(targetPath)) continue;

    const targetFile = app.vault.getFileByPath(targetPath);
    if (!(targetFile instanceof TFile)) continue;

    skipPaths.add(targetPath);
    try {
      await rewriteBacklinks(app, targetFile);
    } finally {
      skipPaths.delete(targetPath);
    }
  }
}
