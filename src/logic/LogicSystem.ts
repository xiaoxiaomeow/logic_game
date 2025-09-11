import type { Formula } from "./Formula";
import type { Level } from "./Level";
import { parseFormula } from "./Parser";
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
	formula: Formula;
	prereq: Partial<PrereqInfo>[];
	constructor(formula: Formula, prereq: Partial<PrereqInfo>[]) {
		this.formula = formula;
		this.prereq = prereq;
	}
	isMet(): Boolean {
		return true;
	}
	isHardMet(): Boolean {
		return true;
	}
	getPrereqs(): Partial<PrereqInfo>[] {
		return this.prereq;
	}
}

export const PropositionalLogic = new LogicSystem("Language.PropositionalLogic.Name", [
	new LogicAxiom(parseFormula('p->q->p'), [{ type: "level", chapterId: "00_propositional_logic", levelId: "03_substitution" }]),
	new LogicAxiom(parseFormula('(p->q->r)->(p->q)->p->r'), [{ type: "level", chapterId: "00_propositional_logic", levelId: "03_substitution" }]),
]);