import type { ElementType } from "react";
import type { LogicSystem } from "./LogicSystem";
import type { Formula } from "./Formula";
import { getLevelState } from "./LevelState";
import type { Chapter } from "./Chapter";
import type { PrerequisiteItem, UnlockableItem, PrereqInfo } from "./Unlockables";

export interface LevelMeta {
	id: string;
	name: string;
	statement: string;
	logicSystem: LogicSystem;
	axioms: Formula[];
	target: Formula;
	type: "main" | "side" | "joke";
	prereqs: PrereqInfo[];
}

export interface LevelModule {
	default: ElementType;
	meta: LevelMeta;
}

export interface LevelState {
	id: string;
	completed: boolean;
}

export class Level implements UnlockableItem, PrerequisiteItem {
	chapter: Chapter;
	meta: LevelMeta;
	constructor(chapter: Chapter, LevelMeta: LevelMeta) {
		this.chapter = chapter;
		this.meta = LevelMeta;
	}
	isMet(): Boolean {
		return getLevelState(this) === "complete";
	}
	getPrereqs(): PrereqInfo[] {
		return this.meta.prereqs;
	}
	isCompleteOrModified(): Boolean {
		return getLevelState(this) === "complete" || getLevelState(this) === "modified";
	}
}