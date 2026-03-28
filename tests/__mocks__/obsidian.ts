export class TFile {
  path: string;
  basename: string;
  extension: string;
  stat: { mtime: number; ctime: number; size: number };
  name: string;
  parent: null;

  constructor(path: string, mtime = 1000) {
    this.path = path;
    this.name = path.split("/").pop()!;
    this.basename = this.name.replace(/\.md$/, "");
    this.extension = "md";
    this.stat = { mtime, ctime: 0, size: 0 };
    this.parent = null;
  }
}

export class TFolder {}
export class App {}
export class Plugin {}
export class PluginSettingTab {}
export class Setting {}
export class Notice {}
export class Modal {}
export class SuggestModal {}
