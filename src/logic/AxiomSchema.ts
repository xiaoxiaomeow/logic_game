import { Implies, type Formula } from "./Formula";

export abstract class AxiomSchema {
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
	abstract getAxiomFromFormulas(formulas: Formula[]): Formula;
	abstract getFormulasFromAxiom(axiom: Formula): Formula[] | null;
}

export class SingleAxiom extends AxiomSchema {
	axiom: Formula;
	constructor(axiom: Formula, name: string | null = null, description: string | null = null, codes: string[] = []) {
		super(0, name ?? `$${axiom.toLatex()}$`, description, codes);
		this.axiom = axiom;
	}
	verifyFormulas(formulas: Formula[]): boolean {
		return formulas.length === 0;
	}
	getAxiomFromFormulas(formulas: Formula[]): Formula {
		if (!this.verifyFormulas(formulas)) {
			throw new Error("Invalid number of formulas");
		}
		return this.axiom;
	}
	getFormulasFromAxiom(axiom: Formula): Formula[] | null {
		if (axiom.equals(this.axiom)) {
			return [];
		}
		return null;
	}
}

class Weakening extends AxiomSchema {
	verifyFormulas(formulas: Formula[]): boolean {
		return formulas.length === 2;
	}
	getAxiomFromFormulas(formulas: Formula[]): Formula {
		if (!this.verifyFormulas(formulas)) {
			throw new Error("Invalid number of formulas");
		}
		const phi = formulas[0];
		const psi = formulas[1];
		return new Implies(phi, new Implies(psi, phi));
	}
	getFormulasFromAxiom(axiom: Formula): Formula[] | null {
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
		super(2, "AxiomSchema.Weakening.Name", "AxiomSchema.Weakening.Description", ["weakening", "wea"]);
	}
}

export const weakening = new Weakening();

class Chain extends AxiomSchema {
	verifyFormulas(formulas: Formula[]): boolean {
		return formulas.length === 3;
	}
	getAxiomFromFormulas(formulas: Formula[]): Formula {
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
	getFormulasFromAxiom(axiom: Formula): Formula[] | null {
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
		super(3, "AxiomSchema.Chain.Name", "AxiomSchema.Chain.Description", ["chain", "cha"]);
	}
}

export const chain = new Chain();