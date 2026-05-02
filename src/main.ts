import { Plugin } from "obsidian";
import { ModeList } from "./core/modeList";
import { CurrentMode } from "./core/currentMode";
import { ObsidianFileSystem } from "./infra/obsidianFileSystem";
import { createMode } from "./core/createMode";
import { CreateModeModal } from "./ui/createModeModal";
import { ZkSettingTab } from "./ui/settingTab";
import { ZkSettings, DEFAULT_SETTINGS } from "./core/zkSettings";

export default class ZkPlugin extends Plugin {
  private modeList = new ModeList();
  private currentMode = new CurrentMode();
  private fs = new ObsidianFileSystem(this.app.vault);
  settings!: ZkSettings;

  async onload(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.addSettingTab(new ZkSettingTab(this.app, this));

    this.addCommand({
      id: "zk-create-mode",
      name: "モードを作成",
      callback: () => {
        new CreateModeModal(this.app, this.settings.defaultTemplateFolder, async (input) => {
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
            await this.app.workspace.openLinkText(mode.currPath, "", true);
          }
        }).open();
      },
    });
  }

  async updateSettings(patch: Partial<ZkSettings>): Promise<void> {
    Object.assign(this.settings, patch);
    await this.saveData(this.settings);
  }
}
