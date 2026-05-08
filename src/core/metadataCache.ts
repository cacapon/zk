export interface MetadataCache {
  getIds(dirPath: string): string[];
  getAliases(dirPath: string): string[];
  getForwardLinks(filePath: string): string[];
  getBacklinks(filePath: string): string[];
  resolveLink(linkText: string, sourcePath: string): string | null;
}
