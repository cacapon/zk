import { Mode } from "./mode";
import { ModeList } from "./modeList";
import { FileSystem } from "./fileSystem";
import { Editor } from "./editor";

export async function openOrCreateZettel(
  name: string,
  mode: Mode,
  modeList: ModeList,
  fs: FileSystem,
  editor: Editor
): Promise<void> {
  const path = `${mode.dirPath}/${name}.md`;

  if (!fs.exists(path)) {
    await fs.createFile(path, "");
  }

  modeList.updateMode({ ...mode, currPath: path });
  await editor.openNote(path);
}
