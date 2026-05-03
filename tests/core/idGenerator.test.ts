import { describe, test, expect } from "vitest";
import { genUniqueID, genUniqueAlias } from "../../src/core/idGenerator";

const VALID_CHARS = /^[23456789abcdefghjkmnpqrstuvwxyz]+$/;

describe("genUniqueID", () => {
  test("指定したprefixで始まる", () => {
    const id = genUniqueID("C", 15, []);
    expect(id.startsWith("C")).toBe(true);
  });

  test("prefix + len の長さになる", () => {
    const id = genUniqueID("C", 15, []);
    expect(id.length).toBe(1 + 15);
  });

  test("prefix以降は有効なアルファベットのみ", () => {
    const id = genUniqueID("C", 15, []);
    expect(VALID_CHARS.test(id.slice(1))).toBe(true);
  });

  test("existingIDsに含まれないIDを返す", () => {
    const existing: string[] = [];
    for (let i = 0; i < 20; i++) {
      const id = genUniqueID("C", 1, existing);
      expect(existing).not.toContain(id);
      existing.push(id);
    }
  });

  test("prefixなしでも生成できる", () => {
    const id = genUniqueID("", 15, []);
    expect(id.length).toBe(15);
    expect(VALID_CHARS.test(id)).toBe(true);
  });

  test("複数回生成しても形式が一定", () => {
    for (let i = 0; i < 10; i++) {
      const id = genUniqueID("S", 10, []);
      expect(id).toMatch(/^S[23456789abcdefghjkmnpqrstuvwxyz]{10}$/);
    }
  });
});

describe("genUniqueAlias", () => {
  test("minLen文字以上のaliasを返す", () => {
    const alias = genUniqueAlias("Cabcdefg", 4, []);
    expect(alias).not.toBeNull();
    expect(alias!.length).toBeGreaterThanOrEqual(4);
  });

  test("idの先頭部分になる", () => {
    const id = "Cabcdefg";
    const alias = genUniqueAlias(id, 4, []);
    expect(id.startsWith(alias!)).toBe(true);
  });

  test("既存aliasと重複しない", () => {
    const alias = genUniqueAlias("Cabcdefg", 4, ["Cabc"]);
    expect(alias).not.toBeNull();
    expect(alias).not.toBe("Cabc");
    expect(alias!.length).toBeGreaterThan(4);
  });

  test("既存aliasにstartWithで引っかかるものがあれば延長する", () => {
    const alias = genUniqueAlias("Cabcdefg", 4, ["Cabc"]);
    expect(alias!.startsWith("Cabc")).toBe(true);
    expect(alias!.length).toBeGreaterThan(4);
  });

  test("全候補が埋まっている場合はnullを返す", () => {
    const id = "Cabc";
    const existingAliases = ["Cabc", "Cab", "Ca", "C"];
    const alias = genUniqueAlias(id, 1, existingAliases);
    expect(alias).toBeNull();
  });
});
