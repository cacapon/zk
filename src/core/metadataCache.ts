export interface MetadataCache {
  getIds(dirPath: string): string[];
  getAliases(dirPath: string): string[];
}
