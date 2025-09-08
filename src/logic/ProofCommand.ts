import type { Formula } from "./Formula";

export class ProofCommand {

}

export class AxiomCommand {
	formula: Formula | number;
	constructor(formula: Formula | number) {
		this.formula = formula;
	}
}

export class DeductionCommand {
	formula: Formula | number;
	constructor(formula: Formula | number) {
		this.formula = formula;
	}
}