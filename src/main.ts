import { Plugin } from "obsidian";
import { ZkSettings, DEFAULT_SETTINGS, ZkSettingTab } from "./settings";
import { ModePathStore } from "./core/modePathStore";
import { selectModeCommand } from "./commands/selectMode";
import { coreModeCommand } from "./commands/coreMode";
import { refModeCommand } from "./commands/refMode";
import { mainActionCommand } from "./commands/mainAction";
import { updateModeStatusBar } from "./ui/statusBar";

export default class ZkPlugin extends Plugin {
  settings!: ZkSettings;
  modePathStore!: ModePathStore;

  async onload() {
    await this.loadSettings();

    this.modePathStore = new ModePathStore({
      Core: this.settings.coreRootPath,
      Ref:  this.settings.refRootPath,
      Temp: this.settings.tempRootPath,
    });

    const statusBarItem = this.addStatusBarItem();
    this.modePathStore.onActiveModeChange((mode) => {
      updateModeStatusBar(statusBarItem, mode);
    });

    this.addSettingTab(new ZkSettingTab(this.app, this));

    this.addCommand({
      id: "select-mode",
      name: "モードを選択する",
      callback: () => {
        selectModeCommand(this.app, this.modePathStore, this.settings);
      },
    });

    this.addCommand({
      id: "core-mode",
      name: "Core: ノートを作成・開く",
      editorCallback: () => {
        coreModeCommand(this.app, this.settings);
      },
    });

    this.addCommand({
      id: "main-action",
      name: "メインアクション（移動 / モード別作成）",
      editorCallback: () => {
        mainActionCommand(this.app, this.modePathStore, this.settings);
      },
    });

    this.addCommand({
      id: "ref-mode",
      name: "Ref: Srcを選んでRefノートを作成",
      callback: () => {
        refModeCommand(this.app, this.settings);
      },
    });

    // TODO: Tempモードコマンド登録
    // TODO: バックリンク自動更新（on-save hook）
    // TODO: 腐敗検知
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
