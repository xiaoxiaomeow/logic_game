import { Implies, type Formula } from "./Formula";
import type { PrereqInfo, UnlockTreeItem } from "./Unlockables";

export abstract class TheoremSchema {
	numFormulas: number;
	name: string;
	codes: string[];
	description: string | null;
	constructor(numFormulas: number, name: string, description: string | null = null, codes: string[] = []) {
		this.numFormulas = numFormulas;
		this.name = name;
		this.codes = codes;
		this.description = description;
	}
	abstract verifyFormulas(formulas: Formula[]): boolean;
	abstract getTheoremFromFormulas(formulas: Formula[]): Formula;
	abstract getFormulasFromTheorem(axiom: Formula): Formula[] | null;
}

export class UnlockableTheorem implements UnlockTreeItem {
	axiom: TheoremSchema;
	prereq: Partial<PrereqInfo>[];
	constructor(axiom: TheoremSchema, prereq: Partial<PrereqInfo>[]) {
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

export class SingleTheorem extends TheoremSchema {
	axiom: Formula;
	constructor(axiom: Formula, name: string | null = null, description: string | null = null, codes: string[] = []) {
		super(0, name ?? `$${axiom.toLatex()}$`, description, codes);
		this.axiom = axiom;
	}
	verifyFormulas(formulas: Formula[]): boolean {
		return formulas.length === 0;
	}
	getTheoremFromFormulas(formulas: Formula[]): Formula {
		if (!this.verifyFormulas(formulas)) {
			throw new Error("Invalid number of formulas");
		}
		return this.axiom;
	}
	getFormulasFromTheorem(axiom: Formula): Formula[] | null {
		if (axiom.equals(this.axiom)) {
			return [];
		}
		return null;
	}
}

class Weakening extends TheoremSchema {
	verifyFormulas(formulas: Formula[]): boolean {
		return formulas.length === 2;
	}
	getTheoremFromFormulas(formulas: Formula[]): Formula {
		if (!this.verifyFormulas(formulas)) {
			throw new Error("Invalid number of formulas");
		}
		const phi = formulas[0];
		const psi = formulas[1];
		return new Implies(phi, new Implies(psi, phi));
	}
	getFormulasFromTheorem(axiom: Formula): Formula[] | null {
		if (axiom instanceof Implies) {
			const phi = axiom.phi;
			const rest = axiom.psi;
			if (rest instanceof Implies) {
				const psi = rest.phi;
				if (rest.psi.equals(phi)) {
					return [phi, psi];
				}
			}
		}
		return null;
	}
	constructor() {
		super(2, "TheoremSchema.Weakening.Name", "TheoremSchema.Weakening.Description", ["weakening", "wea"]);
	}
}

export const weakening = new Weakening();

class Chain extends TheoremSchema {
	verifyFormulas(formulas: Formula[]): boolean {
		return formulas.length === 3;
	}
	getTheoremFromFormulas(formulas: Formula[]): Formula {
		if (!this.verifyFormulas(formulas)) {
			throw new Error("Invalid number of formulas");
		}
		const phi = formulas[0];
		const psi = formulas[1];
		const chi = formulas[2];
		return new Implies(
			new Implies(phi, new Implies(psi, chi)),
			new Implies(new Implies(phi, psi), new Implies(phi, chi))
		);
	}
	getFormulasFromTheorem(axiom: Formula): Formula[] | null {
		if (axiom instanceof Implies) {
			const left = axiom.phi;
			const right = axiom.psi;
			if (left instanceof Implies && right instanceof Implies) {
				const phi = left.phi;
				const rest = left.psi;
				if (rest instanceof Implies) {
					const psi = rest.phi;
					const chi = rest.psi;
					if (right.phi instanceof Implies && right.psi instanceof Implies) {
						if (right.phi.phi.equals(phi) && right.psi.phi.equals(phi) && right.psi.psi.equals(chi)) {
							return [phi, psi, chi];
						}
					}
				}
			}
		}
		return null;
	}
	constructor() {
		super(3, "TheoremSchema.Chain.Name", "TheoremSchema.Chain.Description", ["chain", "cha"]);
	}
}

export const chain = new Chain();