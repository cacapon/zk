import { describe, test, expect } from "vitest";
import { buildTempNote } from "../../src/core/tempNoteTemplate";

describe("buildTempNote", () => {
  test("フロントマターにcreatedが含まれる", () => {
    const result = buildTempNote("2026-03-28");
    expect(result).toContain("created: 2026-03-28");
  });

  test("異なる日付が反映される", () => {
    const result = buildTempNote("2025-01-15");
    expect(result).toContain("created: 2025-01-15");
  });

  test("フロントマターが --- で囲まれている", () => {
    const result = buildTempNote("2026-03-28");
    const lines = result.split("\n");
    expect(lines[0]).toBe("---");
    const closingIndex = lines.indexOf("---", 1);
    expect(closingIndex).toBeGreaterThan(0);
  });

  test("初期の箇条書き行が含まれる", () => {
    const result = buildTempNote("2026-03-28");
    expect(result).toContain("-");
  });
});
