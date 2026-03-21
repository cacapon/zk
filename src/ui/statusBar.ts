import { Mode } from "../core/mode";

const MODE_CONFIG: Record<Mode, { label: string; color: string }> = {
  Core: { label: "● CORE", color: "#4ade80" },
  Ref:  { label: "● REF",  color: "#38bdf8" },
  Temp: { label: "● TMP",  color: "#facc15" },
};

export function updateModeStatusBar(el: HTMLElement, mode: Mode | null): void {
  if (!mode) {
    el.setText("");
    el.removeAttribute("style");
    return;
  }
  const { label, color } = MODE_CONFIG[mode];
  el.setText(label);
  el.setAttribute("style", `color: ${color}; font-weight: bold;`);
}
