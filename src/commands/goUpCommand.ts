import { App, Notice, TFile } from "obsidian";

// 現在のノートの ↑: [[parent]] リンクをたどって親ノートに移動する
export async function goUpCommand(app: App): Promise<void> {
  const file = app.workspace.getActiveFile();
  if (!file) return;

  const content = await app.vault.read(file);
  const match = content.match(/^↑:\s*\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/m);
  if (!match) {
    new Notice("親ノートが見つかりません");
    return;
  }

  const parentName = match[1].trim();
  const parentFile = app.metadataCache.getFirstLinkpathDest(parentName, file.path);
  if (!(parentFile instanceof TFile)) {
    new Notice(`ノートが存在しません: ${parentName}`);
    return;
  }

  await app.workspace.getLeaf().openFile(parentFile);
}
