import { Mode } from "./mode";
import { ModeList } from "./modeList";

export class CurrentMode {
  private name: string | null = null;

  setMode(mode: Mode): void {
    this.name = mode.name;
  }

  getMode(modeList: ModeList): Mode | null {
    if (this.name === null) return null;
    return modeList.getModes().find((m) => m.name === this.name) ?? null;
  }

  clearMode(): void {
    this.name = null;
  }
}
