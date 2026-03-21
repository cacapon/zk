import { App, Editor, TFile } from "obsidian";
import { ZkSettings } from "../settings";
import { genUniqueID, genUniqueAlias } from "../core/idGenerator";
import { collectIDs, collectAliases } from "../core/vaultQuery";
import { buildCoreNote } from "../core/noteTemplate";

function coreFolderPath(settings: ZkSettings): string {
  const p = settings.coreRootPath;
  return p.substring(0, p.lastIndexOf("/"));
}

// カーソル位置が [[...]] の内側にあれば { target, alias } を返す
function getLinkAtCursor(
  editor: Editor
): { target: string; alias: string | null } | null {
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);
  const regex = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;
    if (cursor.ch >= start && cursor.ch <= end) {
      const parts = match[1].trim().split("|");
      return {
        target: parts[0].trim(),
        alias: parts[1] ? parts[1].trim() : null,
      };
    }
  }
  return null;
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

  const folderPath = coreFolderPath(settings);
  if (!app.vault.getFolderByPath(folderPath)) {
    await app.vault.createFolder(folderPath);
  }

  const { content, path } = await buildNewCoreNote(app, settings, title);
  const newFile = await app.vault.create(path, content);
  await app.workspace.getLeaf().openFile(newFile);
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
    const folderPath = coreFolderPath(settings);
    if (!app.vault.getFolderByPath(folderPath)) {
      await app.vault.createFolder(folderPath);
    }
    const { content, path } = await buildNewCoreNote(app, settings, "NewCore");
    const newFile = await app.vault.create(path, content);
    await app.workspace.getLeaf().openFile(newFile);
    return;
  }

  // Case 3: 選択あり → [[選択]] に変換しリンク先を作成して開く
  editor.replaceSelection(`[[${selection}]]`);
  await openOrCreateCoreNote(app, settings, selection);
}
