import { MetadataCache } from "./metadataCache";

export type LinkType = "forward" | "backlink" | "2step";

export interface LinkSwitcherItem {
  path: string;
  type: LinkType;
}

export function getLinkSwitcherItems(
  filePath: string,
  metadataCache: MetadataCache
): LinkSwitcherItem[] {
  const forward = metadataCache.getForwardLinks(filePath);
  const backlinks = metadataCache.getBacklinks(filePath);

  const result: LinkSwitcherItem[] = [];
  const seen = new Set<string>([filePath.toLowerCase()]);

  const addIfNew = (p: string, type: LinkType) => {
    const key = p.toLowerCase();
    if (!seen.has(key)) { result.push({ path: p, type }); seen.add(key); }
  };

  for (const p of forward) addIfNew(p, "forward");
  for (const p of backlinks) addIfNew(p, "backlink");
  for (const f of forward) {
    for (const ff of metadataCache.getForwardLinks(f)) addIfNew(ff, "2step");
  }

  return result;
}
