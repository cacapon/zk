import { Plugin } from "obsidian";
import { ModeList } from "./core/modeList";
import { CurrentMode } from "./core/currentMode";
import { ObsidianFileSystem } from "./infra/obsidianFileSystem";
import { ObsidianEditor } from "./infra/obsidianEditor";
import { createMode } from "./core/createMode";
import { CreateModeModal } from "./ui/createModeModal";
import { ModeSwitcher } from "./ui/modeSwitcher";
import { ZettelNameModal } from "./ui/zettelNameModal";
import { openOrCreateZettel } from "./core/openOrCreateZettel";
import { DeleteModeModal } from "./ui/deleteModeModal";
import { deleteMode } from "./core/deleteMode";
import { ZkSettingTab } from "./ui/settingTab";
import { ZkSettings, DEFAULT_SETTINGS } from "./core/zkSettings";

export default class ZkPlugin extends Plugin {
  private modeList = new ModeList();
  private currentMode = new CurrentMode();
  private fs = new ObsidianFileSystem(this.app.vault);
  private editor = new ObsidianEditor(this.app.workspace);
  settings!: ZkSettings;

  async onload(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.addSettingTab(new ZkSettingTab(this.app, this));

    this.addCommand({
      id: "zk-create-mode",
      name: "モードを作成",
      callback: () => {
        new CreateModeModal(this.app, this.settings.defaultNoteFolder, this.settings.defaultTemplateFolder, async (input) => {
          const ok = await createMode(
            input.name,
            input.dirPath,
            input.tempPath,
            this.modeList,
            this.fs
          );
          if (!ok) {
            // 同名モードが既に存在する場合
            return;
          }

          const mode = this.modeList.getModes().find((m) => m.name === input.name);
          if (mode) {
            this.currentMode.setMode(mode);
            await this.editor.openNote(mode.currPath);
          }
        }).open();
      },
    });

    this.addCommand({
      id: "zk-open-or-create-zettel",
      name: "Zettelを開く・作る",
      callback: async () => {
        const currentMode = this.currentMode.getMode();
        if (!currentMode) {
          new ModeSwitcher(this.app, this.modeList.getModes(), async (mode) => {
            this.currentMode.setMode(mode);
            await this.editor.openNote(mode.currPath);
          }).open();
          return;
        }

        const selection = this.editor.getSelection();
        if (selection) {
          this.editor.replaceSelection(`[[${selection}]]`);
          await openOrCreateZettel(selection, currentMode, this.modeList, this.fs, this.editor);
          return;
        }

        new ZettelNameModal(this.app, "", async (name) => {
          await openOrCreateZettel(name, currentMode, this.modeList, this.fs, this.editor);
        }).open();
      },
    });

    this.addCommand({
      id: "zk-delete-mode",
      name: "モードを削除",
      callback: () => {
        new DeleteModeModal(this.app, this.modeList.getModes(), (mode) => {
          deleteMode(mode, this.modeList, this.currentMode);
        }).open();
      },
    });

    this.addCommand({
      id: "zk-switch-mode",
      name: "モードを切り替え",
      callback: () => {
        new ModeSwitcher(this.app, this.modeList.getModes(), async (mode) => {
          this.currentMode.setMode(mode);
          await this.editor.openNote(mode.currPath);
        }).open();
      },
    });
  }

  async updateSettings(patch: Partial<ZkSettings>): Promise<void> {
    Object.assign(this.settings, patch);
    await this.saveData(this.settings);
  }
}
