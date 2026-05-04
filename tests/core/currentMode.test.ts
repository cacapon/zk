import { describe, it, expect, beforeEach } from "vitest";
import { CurrentMode } from "../../src/core/currentMode";
import { ModeList } from "../../src/core/modeList";
import { Mode } from "../../src/core/mode";

const makeMode = (name: string): Mode => ({
  name,
  dirPath: `/notes/${name}`,
  tempPath: `/templates/${name}.md`,
  currPath: `/notes/${name}/root.md`,
});

describe("CurrentMode", () => {
  let currentMode: CurrentMode;
  let modeList: ModeList;

  beforeEach(() => {
    currentMode = new CurrentMode();
    modeList = new ModeList();
  });

  it("初期状態はnullを返す", () => {
    expect(currentMode.getMode(modeList)).toBeNull();
  });

  it("setModeで設定したモードをgetModeで取得できる", () => {
    const mode = makeMode("Core");
    modeList.addMode(mode);
    currentMode.setMode(mode);
    expect(currentMode.getMode(modeList)?.name).toBe("Core");
  });

  it("setModeを上書きすると新しいモードが返る", () => {
    const core = makeMode("Core");
    const temp = makeMode("Temp");
    modeList.addMode(core);
    modeList.addMode(temp);
    currentMode.setMode(core);
    currentMode.setMode(temp);
    expect(currentMode.getMode(modeList)?.name).toBe("Temp");
  });

  it("clearModeを呼ぶとnullになる", () => {
    const mode = makeMode("Core");
    modeList.addMode(mode);
    currentMode.setMode(mode);
    currentMode.clearMode();
    expect(currentMode.getMode(modeList)).toBeNull();
  });

  it("modeListが更新されると最新のモードが返る", () => {
    const mode = makeMode("Core");
    modeList.addMode(mode);
    currentMode.setMode(mode);
    modeList.updateMode({ ...mode, prefix: "C" });
    expect(currentMode.getMode(modeList)?.prefix).toBe("C");
  });
});
