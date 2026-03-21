import { App, TFile } from "obsidian";
import { ZkSettings } from "../settings";
import { genUniqueID, genUniqueAlias } from "../core/idGenerator";
import { collectIDs, collectAliases } from "../core/vaultQuery";
import { buildCoreNote } from "../core/noteTemplate";
import { getLinkAtCursor } from "../core/editorUtils";

export function coreFolderPath(settings: ZkSettings): string {
  const p = settings.coreRootPath;
  return p.substring(0, p.lastIndexOf("/"));
}

async function ensureFolder(app: App, folderPath: string): Promise<void> {
  if (!app.vault.getFolderByPath(folderPath)) {
    await app.vault.createFolder(folderPath);
  }
}

async function buildNewCoreNote(
  app: App,
  settings: ZkSettings,
  title: string
): Promise<{ content: string; path: string }> {
  const folderPath = coreFolderPath(settings);
  const id = genUniqueID("C", settings.idLen, collectIDs(app, folderPath));
  const alias =
    genUniqueAlias(id, settings.aliasMinLen, collectAliases(app, folderPath)) ??
    id.slice(0, settings.aliasMinLen);

  const parentTitle = app.workspace.getActiveFile()?.basename ?? "HOME";
  const createdDate = new Date().toISOString().split("T")[0];
  const content = buildCoreNote({ id, alias, parentTitle, createdDate });
  const path = `${folderPath}/${title}.md`;

  return { content, path };
}

// Coreノートを新規作成して開く（存在確認なし）
export async function createCoreNote(
  app: App,
  settings: ZkSettings,
  title: string
): Promise<void> {
  const folderPath = coreFolderPath(settings);
  await ensureFolder(app, folderPath);
  const { content, path } = await buildNewCoreNote(app, settings, title);
  const newFile = await app.vault.create(path, content);
  await app.workspace.getLeaf().openFile(newFile);
}

async function openOrCreateCoreNote(
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

  await createCoreNote(app, settings, title);
}

export async function coreModeCommand(
  app: App,
  settings: ZkSettings
): Promise<void> {
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return;

  // Case 1: カーソルが [[...]] の内側
  const link = getLinkAtCursor(editor);
  if (link) {
    await openOrCreateCoreNote(app, settings, link.target);
    return;
  }

  // Case 2: 選択なし → 新規Coreノートを作成して開く
  const selection = editor.getSelection();
  if (!selection) {
    await createCoreNote(app, settings, "NewCore");
    return;
  }

  // Case 3: 選択あり → [[選択]] に変換しリンク先を作成して開く
  editor.replaceSelection(`[[${selection}]]`);
  await openOrCreateCoreNote(app, settings, selection);
}
