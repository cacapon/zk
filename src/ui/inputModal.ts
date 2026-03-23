import { App, SuggestModal } from "obsidian";

export class InputModal extends SuggestModal<string> {
  private onSubmit: (value: string) => void;

  constructor(
    app: App,
    label: string,
    placeholder: string,
    onSubmit: (value: string) => void
  ) {
    super(app);
    this.onSubmit = onSubmit;
    this.setPlaceholder(placeholder);
    this.emptyStateText = label;
  }

  getSuggestions(query: string): string[] {
    return query.trim() ? [query.trim()] : [];
  }

  renderSuggestion(item: string, el: HTMLElement): void {
    el.createEl("div", { text: `「${item}」で作成` });
  }

  onChooseSuggestion(item: string): void {
    this.onSubmit(item);
  }
}
