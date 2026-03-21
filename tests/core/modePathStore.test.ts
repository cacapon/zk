import { describe, test, expect, beforeEach } from 'vitest';
import { Mode } from "../../src/core/mode";
import { ModePathStore } from "../../src/core/modePathStore";

describe("ModePathStore", () => {
  const defaultPaths = {
    Core: "/zk/core",
    Ref: "/zk/ref",
    Temp: "/zk/temp",
  };

  let store: ModePathStore;

  beforeEach(() => {
    store = new ModePathStore(defaultPaths);
  });

  test("初期状態でデフォルトパスが返る", () => {
    expect(store.getPath("Core")).toBe("/zk/core");
    expect(store.getPath("Ref")).toBe("/zk/ref");
    expect(store.getPath("Temp")).toBe("/zk/temp");
  });

  test("setPathで更新したパスが返る", () => {
    store.setPath("Core", "/zk/core/newNote.md");
    expect(store.getPath("Core")).toBe("/zk/core/newNote.md");
  });

  test("あるモードを更新しても他のモードに影響しない", () => {
    store.setPath("Core", "/zk/core/newNote.md");
    expect(store.getPath("Ref")).toBe("/zk/ref");
    expect(store.getPath("Temp")).toBe("/zk/temp");
  });

  test("同じモードを複数回setPathしても最後の値が返る", () => {
    store.setPath("Temp", "/zk/tmp/a.md");
    store.setPath("Temp", "/zk/tmp/b.md");
    expect(store.getPath("Temp")).toBe("/zk/tmp/b.md");
  });
});

describe("ModePathStore - アクティブモード", () => {
  let store: ModePathStore;

  beforeEach(() => {
    store = new ModePathStore({
      Core: "/zk/core",
      Ref: "/zk/ref",
      Temp: "/zk/temp",
    });
  });

  test("初期状態のアクティブモードはnull", () => {
    expect(store.getActiveMode()).toBeNull();
  });

  test("setActiveModeで設定したモードが返る", () => {
    store.setActiveMode("Core");
    expect(store.getActiveMode()).toBe("Core");
  });

  test("setActiveModeで別のモードに切り替えられる", () => {
    store.setActiveMode("Core");
    store.setActiveMode("Ref");
    expect(store.getActiveMode()).toBe("Ref");
  });

  test("onActiveModeChangeのコールバックがsetActiveMode時に呼ばれる", () => {
    const calls: (string | null)[] = [];
    store.onActiveModeChange((mode) => calls.push(mode));
    store.setActiveMode("Core");
    store.setActiveMode("Temp");
    expect(calls).toEqual(["Core", "Temp"]);
  });
});
