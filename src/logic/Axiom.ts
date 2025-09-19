import { AtomicFormula, Implies, type Formula } from "./Formula";
import type { PrereqInfo, UnlockTreeItem } from "./Unlockables";

export class AxiomSchema {
	axiom: Formula;
	freeFormulaVariables: AtomicFormula[];
	codes: string[];
	name: string | null;
	description: string | null;
	constructor(axiom: Formula, freeFormulaVariables: AtomicFormula[] = [], codes: string[] = [], name: string | null = null, description: string | null = null) {
		this.axiom = axiom;
		this.freeFormulaVariables = freeFormulaVariables;
		this.codes = codes;
		this.name = name;
		this.description = description;
	}
	getName(): string {
		return this.name ?? `$${this.axiom.toLatex()}$`
	}
	verifyFormulas(_formulas: Formula[]): boolean {
		return true;
	}
	getAxiomFromFormulas(formulas: Formula[]): Formula {
		return this.axiom.replaceAtomicFormula(this.freeFormulaVariables, formulas);
	}
	getFormulasFromAxiom(axiom: Formula): (Formula | null)[] | null {
		return this.axiom.matches(axiom, this.freeFormulaVariables);
	}
}

export class UnlockableAxiom implements UnlockTreeItem {
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

const p: AtomicFormula = new AtomicFormula("p");
const q: AtomicFormula = new AtomicFormula("q");
const r: AtomicFormula = new AtomicFormula("r");

export const weakening: AxiomSchema = new AxiomSchema(
	new Implies(
		p,
		new Implies(q, p)
	),
	[p, q],
	["weakening", "wea"]
);
export const chain: AxiomSchema = new AxiomSchema(
	new Implies(
		new Implies(p, new Implies(q, r)),
		new Implies(new Implies(p, q), new Implies(p, r))
	),
	[p, q, r],
	["chain", "cha"]
);