import { App, TFile } from "obsidian";
import { ZkSettings } from "./zkSettings";
import { genUniqueID, genUniqueAlias } from "./idGenerator";
import { collectIDs, collectAliases } from "./vaultQuery";

function srcFolderPath(settings: ZkSettings): string {
  return settings.srcRootPath.substring(0, settings.srcRootPath.lastIndexOf("/"));
}

export function isInSrc(path: string, settings: ZkSettings): boolean {
  const folder = srcFolderPath(settings);
  return path !== settings.srcRootPath &&
    (path === folder || path.startsWith(folder + "/"));
}

// SrcノートにIDとエイリアスが未設定なら自動付与する
export async function assignSrcIdIfMissing(
  app: App,
  file: TFile,
  settings: ZkSettings
): Promise<void> {
  const fm = app.metadataCache.getFileCache(file)?.frontmatter;
  if (fm?.id && String(fm.id).trim() !== "") return; // 既にIDあり

  const folderPath = srcFolderPath(settings);
  const id = genUniqueID("S", settings.idLen, collectIDs(app, folderPath));
  const alias =
    genUniqueAlias(id, settings.aliasMinLen, collectAliases(app, folderPath)) ??
    id.slice(0, settings.aliasMinLen);

  await app.fileManager.processFrontMatter(file, (fm) => {
    fm.id = id;
    fm.aliases = [alias];
  });
}
