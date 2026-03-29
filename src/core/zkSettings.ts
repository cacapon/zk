export interface ZkSettings {
  coreRootPath: string;
  refRootPath: string;
  srcRootPath: string;
  tempRootPath: string;
  idLen: number;
  aliasMinLen: number;
  bookSearchCommandId: string;
  enableBacklinks: boolean;
  backlinkExcludePatterns: string[];
  enableDecayDetection: boolean;
  decayDays: number;
  coreNoteTemplatePath: string;
  refNoteTemplatePath: string;
  srcNoteTemplatePath: string;
  coreRootTemplatePath: string;
  refRootTemplatePath: string;
  srcRootTemplatePath: string;
  tempRootTemplatePath: string;
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
  backlinkExcludePatterns: ["Meta/Template/**"],
  enableDecayDetection: true,
  decayDays: 14,
  coreNoteTemplatePath: "Meta/Template/zk-core-note.md",
  refNoteTemplatePath:  "Meta/Template/zk-ref-note.md",
  srcNoteTemplatePath:  "Meta/Template/zk-src-note.md",
  coreRootTemplatePath: "Meta/Template/zk-core-root.md",
  refRootTemplatePath:  "Meta/Template/zk-ref-root.md",
  srcRootTemplatePath:  "Meta/Template/zk-src-root.md",
  tempRootTemplatePath: "Meta/Template/zk-temp-root.md",
};
