import type { LevelModule } from "./Level";

export interface WorldMeta {
	id: string;
	name: string;
	levels: LevelModule[];
	position: { x: number, y: number };
}

export interface WorldModule {
	meta: WorldMeta;
}