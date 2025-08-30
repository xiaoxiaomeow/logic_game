import type { ElementType } from "react";
import type { Formula, LogicSystem } from "./LogicSystem";

export interface LevelMeta {
	id: string;
	name: string;
	statement: string;
	logicSystem: LogicSystem;
	axioms: Formula[];
	target: Formula;
	type: "main" | "side" | "joke";
}

export interface LevelModule {
	default: ElementType;
	meta: LevelMeta;
}

export interface LevelState {
	id: string;
	completed: boolean;
}