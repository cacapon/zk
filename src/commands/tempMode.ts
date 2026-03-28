import { App, TFile } from "obsidian";
import { ZkSettings } from "../settings";
import { buildTempNote } from "../core/tempNoteTemplate";

function tempFolderPath(settings: ZkSettings): string {
  return settings.tempRootPath.substring(0, settings.tempRootPath.lastIndexOf("/"));
}

function resolveUniqueTitle(app: App, folderPath: string, title: string): string {
  if (!app.vault.getFileByPath(`${folderPath}/${title}.md`)) return title;
  let n = 2;
  while (app.vault.getFileByPath(`${folderPath}/${title} ${n}.md`)) n++;
  return `${title} ${n}`;
}

export async function createTempNote(
  app: App,
  settings: ZkSettings,
  title: string
): Promise<void> {
  const folderPath = tempFolderPath(settings);

  if (!app.vault.getFolderByPath(folderPath)) {
    await app.vault.createFolder(folderPath);
  }

  const createdDate = new Date().toISOString().split("T")[0];
  const content = buildTempNote(createdDate);
  const uniqueTitle = resolveUniqueTitle(app, folderPath, title);

  const newFile = await app.vault.create(`${folderPath}/${uniqueTitle}.md`, content);
  await app.workspace.getLeaf().openFile(newFile);
}

export async function openOrCreateTempNote(
  app: App,
  settings: ZkSettings,
  title: string
): Promise<void> {
  const sourcePath = app.workspace.getActiveFile()?.path ?? "";
  const existing = app.metadataCache.getFirstLinkpathDest(title, sourcePath);

  if (existing instanceof TFile) {
    await app.workspace.getLeaf().openFile(existing);
    return;
  }

  await createTempNote(app, settings, title);
}
