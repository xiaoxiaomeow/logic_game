import type { LevelModule } from "./Level";

export interface ChapterMeta {
	id: string;
	name: string;
	levels: LevelModule[];
	position: { x: number, y: number };
}

export interface ChapterModule {
	meta: ChapterMeta;
}