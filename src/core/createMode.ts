import { Mode } from "./mode";
import { ModeList } from "./modeList";
import { FileSystem } from "./fileSystem";

export async function createMode(
  name: string,
  dirPath: string,
  tempPath: string,
  modeList: ModeList,
  fs: FileSystem
): Promise<boolean> {
  const rootPath = `${dirPath}/${name}.md`;
  const mode: Mode = { name, dirPath, tempPath, currPath: rootPath };

  if (!modeList.addMode(mode)) {
    return false;
  }

  if (!fs.exists(dirPath)) {
    await fs.createFolder(dirPath);
  }

  if (!fs.exists(rootPath)) {
    await fs.createFile(rootPath, "");
  }

  const tempDir = tempPath.includes("/") ? tempPath.split("/").slice(0, -1).join("/") : null;
  if (tempDir && !fs.exists(tempDir)) {
    await fs.createFolder(tempDir);
  }

  if (!fs.exists(tempPath)) {
    await fs.createFile(tempPath, "");
  }

  return true;
}
