import { weakening, chain, UnlockableAxiom } from "./Axiom";
import type { Level } from "./Level";
import { identity, UnlockableTheorem } from "./Theorem";
import { isUnlocked } from "./Unlockables";

export class LogicSystem {
	name: string;
	logicAxioms: UnlockableAxiom[];
	logicTheorems: UnlockableTheorem[];
	constructor(name: string, logicAxioms: UnlockableAxiom[], logicTheorems: UnlockableTheorem[]) {
		this.name = name;
		this.logicAxioms = logicAxioms;
		this.logicTheorems = logicTheorems;
	}
	getUnlockedLogicAxioms(upToLevel: Level | null = null): UnlockableAxiom[] {
		return this.logicAxioms.filter(axiom => isUnlocked(axiom, upToLevel));
	}
	getUnlockedLogicTheorems(upToLevel: Level | null = null): UnlockableTheorem[] {
		return this.logicTheorems.filter(theorem => isUnlocked(theorem, upToLevel));
	}
}

export const logicAxioms: UnlockableAxiom[] = [
	new UnlockableAxiom(weakening, [{ type: "level", chapterId: "00_propositional_logic", levelId: "03_axiom_schema" }]),
	new UnlockableAxiom(chain, [{ type: "level", chapterId: "00_propositional_logic", levelId: "03_axiom_schema" }]),
];

export const logicTheorems: UnlockableTheorem[] = [
	new UnlockableTheorem(identity)
];

export const PropositionalLogic = new LogicSystem("Language.PropositionalLogic.Name", logicAxioms, logicTheorems);