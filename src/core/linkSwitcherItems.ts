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

  const forwardSet = new Set(forward);
  const backlinkSet = new Set(backlinks);
  const seen = new Set([filePath, ...forward, ...backlinks]);

  const twoStepSet = new Set<string>();
  for (const f of forward) {
    for (const ff of metadataCache.getForwardLinks(f)) {
      if (!seen.has(ff)) twoStepSet.add(ff);
    }
  }

  return [
    ...forward.map((p) => ({ path: p, type: "forward" as const })),
    ...backlinks
      .filter((p) => !forwardSet.has(p))
      .map((p) => ({ path: p, type: "backlink" as const })),
    ...[...twoStepSet]
      .filter((p) => !forwardSet.has(p) && !backlinkSet.has(p))
      .map((p) => ({ path: p, type: "2step" as const })),
  ];
}
