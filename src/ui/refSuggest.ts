import { App, SuggestModal, TFile } from "obsidian";

export type RefSuggestItem =
  | { type: "current"; label: string; srcFile: TFile }
  | { type: "new";     label: string }
  | { type: "src";     label: string; srcFile: TFile };

export class RefSuggestModal extends SuggestModal<RefSuggestItem> {
  private items: RefSuggestItem[];
  private onSelect: (item: RefSuggestItem) => void;

  constructor(
    app: App,
    items: RefSuggestItem[],
    onSelect: (item: RefSuggestItem) => void
  ) {
    super(app);
    this.items = items;
    this.onSelect = onSelect;
  }

  getSuggestions(query: string): RefSuggestItem[] {
    if (!query) return this.items;
    const lower = query.toLowerCase();
    return this.items.filter((item) =>
      item.label.toLowerCase().includes(lower)
    );
  }

  renderSuggestion(item: RefSuggestItem, el: HTMLElement): void {
    el.createEl("div", { text: item.label });
  }

  onChooseSuggestion(item: RefSuggestItem): void {
    this.onSelect(item);
  }
}
