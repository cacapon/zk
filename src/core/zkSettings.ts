export interface ZkSettings {
  defaultTemplateFolder: string;
  defaultNoteFolder: string;
  autoSwitchMode: boolean;
}

export const DEFAULT_SETTINGS: ZkSettings = {
  defaultTemplateFolder: "Templates",
  defaultNoteFolder: "Zk",
  autoSwitchMode: true,
};
