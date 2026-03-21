import { App, Editor, Notice, TFile } from "obsidian";
import { Mode } from "../core/mode";
import { ZkSettings } from "../settings";
import { ModePathStore } from "../core/modePathStore";
import { getLinkAtCursor } from "../core/editorUtils";
import { detectModeFromPath } from "../core/modeDetector";
import { ModeSuggestModal } from "../ui/modeSuggest";
import { createCoreNote } from "./coreMode";

async function executeAction(
  app: App,
  editor: Editor,
  mode: Mode,
  settings: ZkSettings
): Promise<void> {
  const link = getLinkAtCursor(editor);
  const selection = editor.getSelection();
  const target = link?.target ?? selection ?? null;

  // ターゲットなし → モード別の空ノートを作成
  if (!target) {
    switch (mode) {
      case "Core":
        await createCoreNote(app, settings, "NewCore");
        break;
      case "Ref":
        // TODO: Refモード実装後に追加
        new Notice("Refノートの作成は未実装です");
        break;
      case "Temp":
        // TODO: Tempモード実装後に追加
        new Notice("Tempノートの作成は未実装です");
        break;
    }
    return;
  }

  // ファイルの存在確認
  const sourcePath = app.workspace.getActiveFile()?.path ?? "";
  const existing = app.metadataCache.getFirstLinkpathDest(target, sourcePath);

  if (existing instanceof TFile) {
    // 選択テキストの場合は [[]] で囲んでから移動
    if (!link && selection) editor.replaceSelection(`[[${selection}]]`);
    await app.workspace.getLeaf().openFile(existing);
    return;
  }

  // 存在しない → アクティブモードで作成
  if (!link && selection) editor.replaceSelection(`[[${selection}]]`);

  switch (mode) {
    case "Core":
      await createCoreNote(app, settings, target);
      break;
    case "Ref":
      // TODO: Refモード実装後に追加
      new Notice("Refノートの作成は未実装です");
      break;
    case "Temp":
      // TODO: Tempモード実装後に追加
      new Notice("Tempノートの作成は未実装です");
      break;
  }
}

export async function mainActionCommand(
  app: App,
  store: ModePathStore,
  settings: ZkSettings
): Promise<void> {
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) return;

  // 現在のファイルのパスからモードを自動判定
  const currentFile = app.workspace.getActiveFile();
  const detectedMode = currentFile
    ? detectModeFromPath(currentFile.path, settings)
    : null;

  if (detectedMode) {
    store.setActiveMode(detectedMode);
    await executeAction(app, editor, detectedMode, settings);
    return;
  }

  // 判定できない → storeのアクティブモードを使う
  const storedMode = store.getActiveMode();
  if (storedMode) {
    await executeAction(app, editor, storedMode, settings);
    return;
  }

  // どちらもない → モード選択モーダルを開いて続行
  new ModeSuggestModal(app, async (selectedMode) => {
    store.setActiveMode(selectedMode);
    await executeAction(app, editor, selectedMode, settings);
  }).open();
}
