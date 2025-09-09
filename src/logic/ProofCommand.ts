import { AtomicFormula, Formula, Implies } from "./Formula";
import type Proof from "./Proof";
import { ByAxiom, ByDeduction, ProofLine, ProvedFormulaLine } from "./Proof";

export interface ExcecutionResult {
	success: boolean;
	errorMessage: string | null;
	newLineIndex: number | null;
}

export abstract class ProofCommand {
	abstract excecute(proof: Proof, lineIndex: number): ExcecutionResult;
}

export class AxiomCommand extends ProofCommand {
	formula: Formula | number;
	constructor(formula: Formula | number) {
		super();
		this.formula = formula;
	}
	override excecute(proof: Proof, lineIndex: number): ExcecutionResult {
		let formula: Formula;
		if (typeof (this.formula) === "number") {
			if (0 <= this.formula && this.formula < proof.lines.length) {
				const proofLine: ProofLine = proof.lines[this.formula];
				const provedFormula: Formula | null = proofLine.getProvedFormula();
				if (provedFormula != null) formula = provedFormula;
				else return { success: false, errorMessage: `Line ${this.formula} does not prove any formula.`, newLineIndex: null }
			}
			else return { success: false, errorMessage: `Line ${this.formula} does not exist in the proof.`, newLineIndex: null };
		}
		else formula = this.formula;

		if (proof.axioms.some(axiom => axiom.equals(formula))) {
			const newLine: ProvedFormulaLine = new ProvedFormulaLine(formula, new ByAxiom());
			return { success: true, errorMessage: null, newLineIndex: proof.provideProvedLine(newLine, lineIndex) }
		} else return { success: false, errorMessage: `Formula $${formula.toLatex()}$ is not an axiom.`, newLineIndex: null };
	}
}

export class DeductionCommand extends ProofCommand {
	formula: Formula | number;
	constructor(formula: Formula | number) {
		super();
		this.formula = formula;
	}
	override excecute(proof: Proof, lineIndex: number): ExcecutionResult {
		let formula: Formula;
		if (this.formula instanceof Formula) formula = this.formula;
		else if (0 <= this.formula && this.formula < proof.lines.length) {
			const proofLine: ProofLine = proof.lines[this.formula];
			const provedFormula: Formula | null = proofLine.getProvedFormula();
			if (provedFormula != null) formula = provedFormula;
			else return { success: false, errorMessage: `Line ${this.formula} does not prove any formula.`, newLineIndex: null }
		}
		else return { success: false, errorMessage: `Line ${this.formula} does not exist in the proof.`, newLineIndex: null };

		if (formula instanceof Implies) {
			const phi = formula.phi;
			const psi = formula.psi;
			if (proof.lines.slice(0, lineIndex).some(line => {
				const lineFormula: Formula | null = line.getProvedFormula();
				return lineFormula != null && lineFormula.equals(phi);
			}) && proof.lines.slice(0, lineIndex).some(line => {
				const lineFormula: Formula | null = line.getProvedFormula();
				return lineFormula != null && lineFormula.equals(formula);
			})) {
				const newLine: ProvedFormulaLine = new ProvedFormulaLine(psi, new ByDeduction(formula));
				return { success: true, errorMessage: null, newLineIndex: proof.provideProvedLine(newLine, lineIndex) }
			} else return { success: false, errorMessage: `Either $${formula.toLatex()}$ or $${phi.toLatex()}$ is not proved before the current line.`, newLineIndex: null }
		} else return { success: false, errorMessage: `The formula $${formula.toLatex()}$ is not of the form $\\varphi\\implies\\psi$.`, newLineIndex: null }
	}
}

export class SubstitutionCommand extends ProofCommand {
	formula: Formula | number;
	atomicFormula: Formula;
	replacement: Formula;
	constructor(formula: Formula | number, atomicFormula: Formula, replacement: Formula) {
		super();
		this.formula = formula;
		this.atomicFormula = atomicFormula;
		this.replacement = replacement;
	}
	override excecute(proof: Proof, lineIndex: number): ExcecutionResult {
		let formula: Formula;
		if (this.formula instanceof Formula) formula = this.formula;
		else if (0 <= this.formula && this.formula < proof.lines.length) {
			const proofLine: ProofLine = proof.lines[this.formula];
			const provedFormula: Formula | null = proofLine.getProvedFormula();
			if (provedFormula != null) formula = provedFormula;
			else return { success: false, errorMessage: `Line ${this.formula} does not prove any formula.`, newLineIndex: null }
		}
		else return { success: false, errorMessage: `Line ${this.formula} does not exist in the proof.`, newLineIndex: null };

		if (this.atomicFormula instanceof AtomicFormula) {
			if (proof.lines.slice(0, lineIndex).some(line => {
				const lineFormula: Formula | null = line.getProvedFormula();
				return lineFormula != null && lineFormula.equals(formula);
			})) {
				const newLine: ProvedFormulaLine = new ProvedFormulaLine(formula.replaceAtomicFormula(this.atomicFormula, this.replacement), new ByDeduction(formula));
				return { success: true, errorMessage: null, newLineIndex: proof.provideProvedLine(newLine, lineIndex) }
			} else return { success: false, errorMessage: `Formula $${formula.toLatex()}$ is not proved before the current line.`, newLineIndex: null }
		} else return { success: false, errorMessage: `The formula $${this.atomicFormula.toLatex()}$ is not an atomic formula.`, newLineIndex: null }
	}
}