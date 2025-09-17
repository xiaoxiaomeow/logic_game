import { weakening, chain, type AxiomSchema } from "./AxiomSchema";
import type { Level } from "./Level";
import { isUnlocked, type PrereqInfo, type UnlockTreeItem } from "./Unlockables";

export class LogicSystem {
	name: string;
	logicAxioms: LogicAxiom[];
	constructor(name: string, logicAxioms: LogicAxiom[]) {
		this.name = name;
		this.logicAxioms = logicAxioms;
	}
	getUnlockedLogicAxioms(upToLevel: Level | null = null): LogicAxiom[] {
		return this.logicAxioms.filter(axiom => isUnlocked(axiom, upToLevel));
	}
}

export class LogicAxiom implements UnlockTreeItem {
	axiom: AxiomSchema;
	prereq: Partial<PrereqInfo>[];
	constructor(axiom: AxiomSchema, prereq: Partial<PrereqInfo>[]) {
		this.axiom = axiom;
		this.prereq = prereq;
	}
	isMet(): Boolean {
		return true;
	}
	getPrereqs(): Partial<PrereqInfo>[] {
		return this.prereq;
	}
}

export const PropositionalLogic = new LogicSystem("Language.PropositionalLogic.Name", [
	new LogicAxiom(weakening, [{ type: "level", chapterId: "00_propositional_logic", levelId: "03_axiom_schema" }]),
	new LogicAxiom(chain, [{ type: "level", chapterId: "00_propositional_logic", levelId: "03_axiom_schema" }]),
]);