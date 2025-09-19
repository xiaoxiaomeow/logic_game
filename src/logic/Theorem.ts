import { AxiomSchema } from "./Axiom";
import { AtomicFormula, Implies, type Formula } from "./Formula";
import type { PrereqInfo, UnlockTreeItem } from "./Unlockables";

export class TheoremSchema extends AxiomSchema {
	chapterId: string;
	levelId: string;
	constructor(theorem: Formula, chapterId: string, levelId: string, freeFormulaVariables: AtomicFormula[] = [], codes: string[] = [], name: string | null = null, description: string | null = null) {
		super(theorem, freeFormulaVariables, codes, name, description);
		this.chapterId = chapterId;
		this.levelId = levelId;
	}
}

export class UnlockableTheorem implements UnlockTreeItem {
	theorem: TheoremSchema;
	prereq: Partial<PrereqInfo>[];
	constructor(theorem: TheoremSchema, prereq: Partial<PrereqInfo>[] = []) {
		this.theorem = theorem;
		this.prereq = [{ type: "level", chapterId: theorem.chapterId, levelId: theorem.levelId }, ...prereq];
	}
	isMet(): Boolean {
		return true;
	}
	getPrereqs(): Partial<PrereqInfo>[] {
		return this.prereq;
	}
}

const p: AtomicFormula = new AtomicFormula("p");
// const q: AtomicFormula = new AtomicFormula("q");
// const r: AtomicFormula = new AtomicFormula("r");

export const identity: TheoremSchema = new TheoremSchema(
	new Implies(p, p),
	"00_propositional_logic",
	"04_logic_axiom",
	[p],
	["implies_identity", "imp_ide"]
);