import { App, TFile, TFolder } from "obsidian";

export function getMdFiles(app: App, folderPath: string): TFile[] {
  const folder = app.vault.getFolderByPath(folderPath);
  if (!folder) return [];

  const result: TFile[] = [];
  const walk = (node: TFile | TFolder) => {
    if (node instanceof TFolder) {
      for (const child of node.children) walk(child as TFile | TFolder);
    } else if (node instanceof TFile && node.extension === "md") {
      result.push(node);
    }
  };
  walk(folder);
  return result;
}

function getFrontmatter(app: App, file: TFile): Record<string, unknown> | null {
  return app.metadataCache.getFileCache(file)?.frontmatter ?? null;
}

export function collectIDs(app: App, folderPath: string): string[] {
  return getMdFiles(app, folderPath).flatMap((f) => {
    const id = getFrontmatter(app, f)?.id;
    if (!id) return [];
    return Array.isArray(id) ? id : [String(id)];
  });
}

export function collectAliases(app: App, folderPath: string): string[] {
  return getMdFiles(app, folderPath).flatMap((f) => {
    const aliases = getFrontmatter(app, f)?.aliases;
    if (!aliases) return [];
    return Array.isArray(aliases) ? aliases.map(String) : [String(aliases)];
  });
}
