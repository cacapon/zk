export interface ZkSettings {
  coreRootPath: string;
  refRootPath: string;
  srcRootPath: string;
  tempRootPath: string;
  idLen: number;
  aliasMinLen: number;
  bookSearchCommandId: string;
  enableBacklinks: boolean;
  enableDecayDetection: boolean;
  decayDays: number;
}

export const DEFAULT_SETTINGS: ZkSettings = {
  coreRootPath: "Core/Core.md",
  refRootPath: "Ref/Ref.md",
  srcRootPath: "Src/Src.md",
  tempRootPath: "Temp/Temp.md",
  idLen: 15,
  aliasMinLen: 4,
  bookSearchCommandId: "obsidian-book-search-plugin:open-book-search-dialog",
  enableBacklinks: true,
  enableDecayDetection: true,
  decayDays: 14,
};
