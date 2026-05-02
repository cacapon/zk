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

  if (!fs.exists(tempPath)) {
    await fs.createFile(tempPath, "");
  }

  return true;
}
