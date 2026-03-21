export interface ZkSettings {
  coreRootPath: string;
  refRootPath: string;
  tempRootPath: string;
  idLen: number;
  aliasMinLen: number;
  enableBacklinks: boolean;
  enableDecayDetection: boolean;
  decayDays: number;
}

export const DEFAULT_SETTINGS: ZkSettings = {
  coreRootPath: "Core/Core.md",
  refRootPath: "Ref/Ref.md",
  tempRootPath: "Temp/Temp.md",
  idLen: 15,
  aliasMinLen: 4,
  enableBacklinks: true,
  enableDecayDetection: true,
  decayDays: 14,
};
