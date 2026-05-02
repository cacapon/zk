import { App, SuggestModal } from "obsidian";

export interface SuggestionItem {
  label: string;
  sub?: string;
  onChoose: () => void;
}

export class Switcher extends SuggestModal<SuggestionItem> {
  constructor(
    app: App,
    private items: SuggestionItem[]
  ) {
    super(app);
  }

  getSuggestions(query: string): SuggestionItem[] {
    return this.items.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    );
  }

  renderSuggestion(item: SuggestionItem, el: HTMLElement): void {
    el.createEl("div", { text: item.label });
    if (item.sub) {
      el.createEl("small", { text: item.sub });
    }
  }

  onChooseSuggestion(item: SuggestionItem): void {
    item.onChoose();
  }
}
