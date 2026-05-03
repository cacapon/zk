import { App, Modal, Setting } from "obsidian";

export class ZettelNameModal extends Modal {
  private name = "";

  constructor(
    app: App,
    private initialName: string,
    private onSubmit: (name: string) => void
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl("h2", { text: "Zettelを開く・作る" });

    const errorEl = contentEl.createEl("p");
    errorEl.style.color = "var(--text-error)";
    errorEl.style.display = "none";

    const submit = () => {
      if (!this.name) {
        errorEl.setText("ノート名を入力してください");
        errorEl.style.display = "";
        return;
      }
      this.close();
      this.onSubmit(this.name);
    };

    new Setting(contentEl)
      .setName("ノート名")
      .addText((t) => {
        t.setValue(this.initialName)
          .onChange((v) => { this.name = v.trim(); });
        t.inputEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.isComposing) { e.preventDefault(); submit(); }
        });
      });

    new Setting(contentEl)
      .addButton((btn) => {
        btn.setButtonText("キャンセル").onClick(() => { this.close(); });
      })
      .addButton((btn) => {
        btn.setButtonText("開く・作る").setCta().onClick(submit);
      });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
