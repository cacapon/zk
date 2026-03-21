import { Mode } from './mode';

type ModePaths = Record<Mode, string>;

export class ModePathStore {
	private paths: ModePaths;
	private activeMode: Mode | null = null;
	private onModeChange?: (mode: Mode | null) => void;

	constructor(defaults: ModePaths) {
		this.paths = { ...defaults };
	}

	getPath(mode: Mode): string {
		return this.paths[mode];
	}

	setPath(mode: Mode, path: string): void {
		this.paths[mode] = path;
	}

	getActiveMode(): Mode | null {
		return this.activeMode;
	}

	setActiveMode(mode: Mode): void {
		this.activeMode = mode;
		this.onModeChange?.(mode);
	}

	onActiveModeChange(callback: (mode: Mode | null) => void): void {
		this.onModeChange = callback;
	}
}
