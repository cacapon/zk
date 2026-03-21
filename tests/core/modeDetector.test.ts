import { describe, test, expect } from "vitest";
import { detectModeFromPath } from "../../src/core/modeDetector";
import { ZkSettings, DEFAULT_SETTINGS } from "../../src/core/zkSettings";

const settings: ZkSettings = {
  ...DEFAULT_SETTINGS,
  coreRootPath: "Core/Core.md",
  refRootPath:  "Ref/Ref.md",
  tempRootPath: "Temp/Temp.md",
};

describe("detectModeFromPath", () => {
  test("Coreフォルダ以下のファイルはCoreと判定される", () => {
    expect(detectModeFromPath("Core/someNote.md", settings)).toBe("Core");
  });

  test("Refフォルダ以下のファイルはRefと判定される", () => {
    expect(detectModeFromPath("Ref/someNote.md", settings)).toBe("Ref");
  });

  test("Tempフォルダ以下のファイルはTempと判定される", () => {
    expect(detectModeFromPath("Temp/someNote.md", settings)).toBe("Temp");
  });

  test("サブフォルダ内のファイルも正しく判定される", () => {
    expect(detectModeFromPath("Core/sub/deep.md", settings)).toBe("Core");
  });

  test("どのモードにも属さないファイルはnullを返す", () => {
    expect(detectModeFromPath("Other/note.md", settings)).toBeNull();
  });

  test("フォルダ名の前方一致では誤判定しない", () => {
    expect(detectModeFromPath("CoreExtra/note.md", settings)).toBeNull();
  });

  test("ルートノート自体もそのモードと判定される", () => {
    expect(detectModeFromPath("Core/Core.md", settings)).toBe("Core");
  });
});
