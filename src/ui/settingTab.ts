import { App, PluginSettingTab, Setting, setIcon } from "obsidian";
import type ZkPlugin from "../main";
import { IconPickerModal } from "./iconPickerModal";

export class ZkSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: ZkPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("デフォルトノートフォルダ")
      .setDesc("モード作成時のフォルダパスの初期値に使われます")
      .addText((t) => {
        t.setPlaceholder("Zk")
          .setValue(this.plugin.settings.defaultNoteFolder)
          .onChange(async (v) => {
            await this.plugin.updateSettings({ defaultNoteFolder: v.trim() });
          });
      });

    new Setting(containerEl)
      .setName("デフォルトテンプレートフォルダ")
      .setDesc("モード作成時のテンプレートパスの初期値に使われます")
      .addText((t) => {
        t.setPlaceholder("Templates")
          .setValue(this.plugin.settings.defaultTemplateFolder)
          .onChange(async (v) => {
            await this.plugin.updateSettings({ defaultTemplateFolder: v.trim() });
          });
      });

    containerEl.createEl("h2", { text: "モード設定" });

    for (const mode of this.plugin.getModes()) {
      new Setting(containerEl)
        .setName(mode.name)
        .addButton((btn) => {
          if (mode.icon) setIcon(btn.buttonEl, mode.icon);
          else btn.setButtonText("(なし)");
          btn.setTooltip("アイコンを変更").onClick(() => {
            new IconPickerModal(this.app, async (iconId) => {
              await this.plugin.updateModeConfig(mode.name, { icon: iconId, prefix: mode.prefix });
              btn.buttonEl.empty();
              if (iconId) setIcon(btn.buttonEl, iconId);
              else btn.buttonEl.setText("(なし)");
            }).open();
          });
        })
        .addText((t) => {
          t.setPlaceholder("プレフィックス（例: C）")
            .setValue(mode.prefix ?? "")
            .onChange(async (v) => {
              await this.plugin.updateModeConfig(mode.name, { icon: mode.icon, prefix: v.trim() });
            });
        });
    }
  }
}
