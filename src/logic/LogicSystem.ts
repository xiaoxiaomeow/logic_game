import { weakening, chain, UnlockableAxiom } from "./Axiom";
import type { Level } from "./Level";
import { isUnlocked } from "./Unlockables";

export class LogicSystem {
	name: string;
	logicAxioms: UnlockableAxiom[];
	constructor(name: string, logicAxioms: UnlockableAxiom[]) {
		this.name = name;
		this.logicAxioms = logicAxioms;
	}
	getUnlockedLogicAxioms(upToLevel: Level | null = null): UnlockableAxiom[] {
		return this.logicAxioms.filter(axiom => isUnlocked(axiom, upToLevel));
	}
}

export const PropositionalLogic = new LogicSystem("Language.PropositionalLogic.Name", [
	new UnlockableAxiom(weakening, [{ type: "level", chapterId: "00_propositional_logic", levelId: "03_axiom_schema" }]),
	new UnlockableAxiom(chain, [{ type: "level", chapterId: "00_propositional_logic", levelId: "03_axiom_schema" }]),
]);