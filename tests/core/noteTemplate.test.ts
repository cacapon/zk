import { describe, test, expect } from "vitest";
import { buildCoreNote } from "../../src/core/noteTemplate";

const BASE_PARAMS = {
  id: "Cabc1234567890x",
  alias: "Cabc",
  parentTitle: "HOME",
  createdDate: "2026-03-21",
};

describe("buildCoreNote", () => {
  test("フロントマターにidが含まれる", () => {
    const result = buildCoreNote(BASE_PARAMS);
    expect(result).toContain(`id: "${BASE_PARAMS.id}"`);
  });

  test("フロントマターにaliasが含まれる", () => {
    const result = buildCoreNote(BASE_PARAMS);
    expect(result).toContain(`- "${BASE_PARAMS.alias}"`);
  });

  test("フロントマターにcreatedDateが含まれる", () => {
    const result = buildCoreNote(BASE_PARAMS);
    expect(result).toContain(`created: ${BASE_PARAMS.createdDate}`);
  });

  test("親ノートへのリンクが含まれる", () => {
    const result = buildCoreNote(BASE_PARAMS);
    expect(result).toContain(`↑: [[${BASE_PARAMS.parentTitle}]]`);
  });

  test("バックリンクセクションが含まれる", () => {
    const result = buildCoreNote(BASE_PARAMS);
    expect(result).toContain("<!-- ZK_BACKLINKS_START -->");
    expect(result).toContain("<!-- ZK_BACKLINKS_END -->");
  });

  test("フロントマターが --- で囲まれている", () => {
    const result = buildCoreNote(BASE_PARAMS);
    const lines = result.split("\n");
    expect(lines[0]).toBe("---");
    const closingIndex = lines.indexOf("---", 1);
    expect(closingIndex).toBeGreaterThan(0);
  });

  test("異なるparentTitleが反映される", () => {
    const result = buildCoreNote({ ...BASE_PARAMS, parentTitle: "SomeNote" });
    expect(result).toContain("↑: [[SomeNote]]");
  });
});
