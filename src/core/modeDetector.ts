import { Mode } from "./mode";
import { ZkSettings } from "./zkSettings";

function folderPath(rootNotePath: string): string {
  return rootNotePath.substring(0, rootNotePath.lastIndexOf("/"));
}

// ファイルパスからモードを判定する。どのモードにも属さない場合はnullを返す。
export function detectModeFromPath(
  filePath: string,
  settings: ZkSettings
): Mode | null {
  const folders: [Mode, string][] = [
    ["Core", folderPath(settings.coreRootPath)],
    ["Ref",  folderPath(settings.refRootPath)],
    ["Ref",  folderPath(settings.srcRootPath)],  // SrcフォルダもRefモードとして扱う
    ["Temp", folderPath(settings.tempRootPath)],
  ];

  for (const [mode, folder] of folders) {
    if (filePath === folder || filePath.startsWith(folder + "/")) {
      return mode;
    }
  }
  return null;
}
