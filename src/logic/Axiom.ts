import { AtomicFormula, Implies, type Formula } from "./Formula";
import type { PrereqInfo, UnlockTreeItem } from "./Unlockables";

export class AxiomSchema {
	axiom: Formula;
	freeFormulaVariables: AtomicFormula[];

	name: string | null;
	codes: string[];
	description: string | null;
	constructor(axiom: Formula, freeFormulaVariables: AtomicFormula[] = [], name: string | null = null, description: string | null = null, codes: string[] = []) {
		this.axiom = axiom;
		this.freeFormulaVariables = freeFormulaVariables;
		this.name = name;
		this.codes = codes;
		this.description = description;
	}
	getName(): string {
		return this.name ?? `$${this.axiom.toLatex()}$`
	}
	verifyFormulas(formulas: Formula[]): boolean {
		return formulas.length === this.freeFormulaVariables.length;
	}
	getAxiomFromFormulas(formulas: Formula[]): Formula {
		let result: Formula = this.axiom;
		for (let i = 0; i < this.freeFormulaVariables.length; i++) {
			result = result.replaceAtomicFormula(this.freeFormulaVariables[i], formulas[i]);
		}
		return result;
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
	"AxiomSchema.Weakening.Name",
	"AxiomSchema.Weakening.Description",
	["weakening", "wea"]
);
export const chain: AxiomSchema = new AxiomSchema(
	new Implies(
		new Implies(p, new Implies(q, r)),
		new Implies(new Implies(p, q), new Implies(p, r))
	),
	[p, q, r],
	"AxiomSchema.Chain.Name",
	"AxiomSchema.Chain.Description",
	["chain", "cha"]
);