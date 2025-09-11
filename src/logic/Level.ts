import type { ElementType } from "react";
import type { LogicSystem } from "./LogicSystem";
import type { Formula } from "./Formula";
import { getLevelState } from "./LevelState";
import type { Chapter } from "./Chapter";
import type { UnlockTreeItem, PrereqInfo } from "./Unlockables";

export interface LevelMeta {
	id: string;
	name: string;
	statement: string;
	logicSystem: LogicSystem;
	axioms: Formula[];
	target: Formula;
	type: "main" | "side" | "joke";
	prereqs: PrereqInfo[];
	hardPrereqs: PrereqInfo[];
}

export interface LevelModule {
	default: ElementType;
	meta: LevelMeta;
}

export interface LevelState {
	id: string;
	completed: boolean;
}

export class Level implements UnlockTreeItem {
	chapter: Chapter;
	meta: LevelMeta;
	constructor(chapter: Chapter, LevelMeta: LevelMeta) {
		this.chapter = chapter;
		this.meta = LevelMeta;
	}
	isMet(): Boolean {
		return this.isCompleteOrModified();
	}
	isHardMet(): Boolean {
		return this.isComplete();
	}
	getPrereqs(): PrereqInfo[] {
		return this.meta.prereqs;
	}
	getHardPrereqs(): PrereqInfo[] {
		throw this.meta.hardPrereqs;
	}
	isComplete(): Boolean {
		return getLevelState(this) === "complete";
	}
	isCompleteOrModified(): Boolean {
		return getLevelState(this) === "complete" || getLevelState(this) === "modified";
	}
}