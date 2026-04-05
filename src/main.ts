import { Plugin } from "obsidian";
import { ZkSettings, DEFAULT_SETTINGS, ZkSettingTab } from "./settings";
import { ModePathStore } from "./core/modePathStore";
import { selectModeCommand } from "./commands/selectMode";
import { coreModeCommand } from "./commands/coreMode";
import { refModeCommand } from "./commands/refMode";
import { mainActionCommand } from "./commands/mainAction";
import { updateModeStatusBar } from "./ui/statusBar";
import { updateDecayList } from "./core/decayDetector";
import { updateBacklinksOf, isInCoreOrRef } from "./core/backlinkUpdater";
import { assignSrcIdIfMissing, isInSrc } from "./core/srcIdAssigner";
import { detectModeFromPath } from "./core/modeDetector";
import { initializeCommand } from "./commands/initializeCommand";
import { goUpCommand } from "./commands/goUpCommand";

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

    this.addCommand({
      id: "initialize",
      name: "テンプレートとルートノートを初期化する",
      callback: () => {
        initializeCommand(this.app, this.settings);
      },
    });

    this.addCommand({
      id: "go-up",
      name: "親ノートに移動する（↑）",
      callback: () => {
        goUpCommand(this.app);
      },
    });

    // ファイルを開いたタイミングの処理
    this.registerEvent(
      this.app.workspace.on("file-open", async (file) => {
        if (!file) return;

        // モードのアクティブパスを更新
        const detectedMode = detectModeFromPath(file.path, this.settings);
        if (detectedMode) {
          this.modePathStore.setPath(detectedMode, file.path);
        }

        if (file.path === this.settings.tempRootPath) {
          await updateDecayList(this.app, this.settings);
        }
        if (this.settings.enableBacklinks && (
          isInCoreOrRef(file.path, this.settings) ||
          isInSrc(file.path, this.settings) ||
          file.path === this.settings.srcRootPath ||
          file.path === this.settings.tempRootPath
        )) {
          await updateBacklinksOf(this.app, file, this.settings.backlinkExcludePatterns);
        }
        if (isInSrc(file.path, this.settings)) {
          await assignSrcIdIfMissing(this.app, file, this.settings);
        }
      })
    );
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
