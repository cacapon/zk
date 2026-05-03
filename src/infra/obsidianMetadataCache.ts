import { MetadataCache as ObsidianMC } from "obsidian";
import { MetadataCache } from "../core/metadataCache";

export class ObsidianMetadataCache implements MetadataCache {
  constructor(private cache: ObsidianMC) {}

  getIds(dirPath: string): string[] {
    return this.getFrontmatterValues(dirPath, "zkid");
  }

  getAliases(dirPath: string): string[] {
    return this.getFrontmatterValues(dirPath, "aliases").flat();
  }

  private getFrontmatterValues(dirPath: string, key: string): string[] {
    const results: string[] = [];
    const files = Object.keys(this.cache.resolvedLinks);
    for (const path of files) {
      if (!path.startsWith(dirPath + "/")) continue;
      const fm = this.cache.getCache(path)?.frontmatter;
      if (!fm) continue;
      const val = fm[key];
      if (Array.isArray(val)) results.push(...val);
      else if (typeof val === "string") results.push(val);
    }
    return results;
  }
}
