import { Level, type LevelModule } from "./Level";
import type { UnlockableItem, PrerequisiteItem, PrereqInfo } from "./Unlockables";

export interface ChapterMeta {
	id: string;
	name: string;
	levels: LevelModule[];
	position: { x: number, y: number };
	prereqs: PrereqInfo[];
}

export interface ChapterModule {
	meta: ChapterMeta;
}

export class Chapter implements UnlockableItem, PrerequisiteItem {
	meta: ChapterMeta;
	levels: Level[];
	constructor(chapterMeta: ChapterMeta) {
		this.meta = chapterMeta;
		this.levels = chapterMeta.levels.map(levelModule => new Level(this, levelModule.meta))
	}
	isMet(): Boolean {
		return this.levels.every(level => level.isMet() || level.meta.type !== "main");
	}
	getPrereqs(): PrereqInfo[] {
		return this.meta.prereqs;
	}
}