import { AbstractInputSuggest, App, TFile } from "obsidian";

export class FileSuggest extends AbstractInputSuggest<TFile> {
  private el: HTMLInputElement;

  constructor(
    app: App,
    inputEl: HTMLInputElement,
    private folderPath: string
  ) {
    super(app, inputEl);
    this.el = inputEl;
  }

  getSuggestions(query: string): TFile[] {
    const lower = query.toLowerCase();
    return this.app.vault.getMarkdownFiles().filter(
      (f) =>
        (!this.folderPath || f.path.startsWith(this.folderPath + "/")) &&
        f.path.toLowerCase().includes(lower)
    );
  }

  renderSuggestion(file: TFile, el: HTMLElement): void {
    el.setText(file.path);
  }

  selectSuggestion(file: TFile): void {
    this.setValue(file.path);
    this.el.dispatchEvent(new Event("input"));
    this.close();
  }
}
