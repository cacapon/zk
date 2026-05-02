import { App, SuggestModal } from "obsidian";
import { Mode } from "../core/mode";

export class ModeSwitcher extends SuggestModal<Mode> {
  constructor(
    app: App,
    private modes: Mode[],
    private onChoose: (mode: Mode) => void
  ) {
    super(app);
  }

  getSuggestions(query: string): Mode[] {
    return this.modes.filter((m) =>
      m.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  renderSuggestion(mode: Mode, el: HTMLElement): void {
    el.createEl("div", { text: mode.name });
    el.createEl("small", { text: mode.dirPath });
  }

  onChooseSuggestion(mode: Mode): void {
    this.onChoose(mode);
  }
}
