import { App, PluginSettingTab, Setting } from "obsidian";
import type ZkPlugin from "../main";

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
  }
}
