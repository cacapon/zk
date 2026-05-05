import { describe, it, expect } from "vitest";
import { getLinkSwitcherItems } from "../../src/core/linkSwitcherItems";
import { MetadataCache } from "../../src/core/metadataCache";

const makeCache = (
  forwardMap: Record<string, string[]>,
  backlinksMap?: Record<string, string[]>
): MetadataCache => ({
  getIds: () => [],
  getAliases: () => [],
  getForwardLinks: (path) => forwardMap[path] ?? [],
  getBacklinks: (path) => backlinksMap?.[path] ?? [],
});

describe("getLinkSwitcherItems", () => {
  it("リンク先（forward）を返す", () => {
    const cache = makeCache({ "a.md": ["b.md", "c.md"] });
    const items = getLinkSwitcherItems("a.md", cache);
    expect(items).toEqual([
      { path: "b.md", type: "forward" },
      { path: "c.md", type: "forward" },
    ]);
  });

  it("バックリンクを返す", () => {
    const cache = makeCache({}, { "a.md": ["x.md", "y.md"] });
    const items = getLinkSwitcherItems("a.md", cache);
    expect(items).toEqual([
      { path: "x.md", type: "backlink" },
      { path: "y.md", type: "backlink" },
    ]);
  });

  it("forwardとbacklink両方にある場合はforwardを優先する", () => {
    const cache = makeCache(
      { "a.md": ["b.md"] },
      { "a.md": ["b.md", "c.md"] }
    );
    const items = getLinkSwitcherItems("a.md", cache);
    expect(items.find((i) => i.path === "b.md")?.type).toBe("forward");
    expect(items.filter((i) => i.path === "b.md")).toHaveLength(1);
  });

  it("2STEPリンクを返す", () => {
    const cache = makeCache({
      "a.md": ["b.md"],
      "b.md": ["c.md"],
    });
    const items = getLinkSwitcherItems("a.md", cache);
    expect(items).toContainEqual({ path: "c.md", type: "2step" });
  });

  it("2STEPリンクにforwardやbacklinkと重複するものは含まない", () => {
    const cache = makeCache(
      { "a.md": ["b.md"], "b.md": ["c.md", "a.md"] },
      { "a.md": ["c.md"] }
    );
    const items = getLinkSwitcherItems("a.md", cache);
    expect(items.filter((i) => i.path === "c.md")).toHaveLength(1);
    expect(items.find((i) => i.path === "c.md")?.type).toBe("backlink");
    expect(items.filter((i) => i.path === "a.md")).toHaveLength(0);
  });

  it("リンクがない場合は空配列を返す", () => {
    const cache = makeCache({});
    expect(getLinkSwitcherItems("a.md", cache)).toEqual([]);
  });
});
