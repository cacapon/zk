export interface Editor {
  openNote(path: string): Promise<void>;
}
