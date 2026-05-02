import { App, Modal, Setting } from "obsidian";

export class ConfirmModal extends Modal {
  constructor(
    app: App,
    private message: string,
    private onConfirm: () => void
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;

    contentEl.createEl("p", { text: this.message });

    new Setting(contentEl)
      .addButton((btn) => {
        btn.setButtonText("キャンセル").onClick(() => {
          this.close();
        });
      })
      .addButton((btn) => {
        btn.setButtonText("削除").setCta().setWarning().onClick(() => {
          this.close();
          this.onConfirm();
        });
      });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
