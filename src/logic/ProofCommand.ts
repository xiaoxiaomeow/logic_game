import { AtomicFormula, Formula, Implies } from "./Formula";
import type Proof from "./Proof";
import { ByAxiom, ByDeduction, ByLogicAxiom, BySubstitution, ProofLine, ProvedFormulaLine, UnprovedFormulaLine } from "./Proof";
import type { PrereqInfo, UnlockTreeItem } from "./Unlockables";

export interface ExcecutionResult {
	success: boolean;
	errorMessage: string;
	newLineIndex: number;
}

export abstract class ProofCommand implements UnlockTreeItem {
	abstract excecute(proof: Proof, lineIndex: number): Partial<ExcecutionResult>;
	prereqs: Partial<PrereqInfo>[];
	constructor(prereqs: Partial<PrereqInfo>[]) {
		this.prereqs = prereqs;
	}
	isMet(): Boolean {
		return true;
	}
	isHardMet(): Boolean {
		return true;
	}
	getPrereqs(): Partial<PrereqInfo>[] {
		return this.prereqs;
	}
}

export class AxiomCommand extends ProofCommand {
	formula: Formula | number;
	constructor(formula: Formula | number) {
		super([]);
		this.formula = formula;
	}
	override excecute(proof: Proof, lineIndex: number): Partial<ExcecutionResult> {
		let formula: Formula;
		if (typeof (this.formula) === "number") {
			if (0 <= this.formula && this.formula < proof.lines.length) {
				const proofLine: ProofLine = proof.lines[this.formula];
				const provedFormula: Formula | null = proofLine.getProvedFormula();
				if (provedFormula != null) formula = provedFormula;
				else return { success: false, errorMessage: `Line ${this.formula} does not prove any formula.` }
			}
			else return { success: false, errorMessage: `Line ${this.formula} does not exist in the proof.` };
		}
		else formula = this.formula;

		if (proof.axioms.some(axiom => axiom.equals(formula))) {
			const newLine: ProvedFormulaLine = new ProvedFormulaLine(formula, new ByAxiom());
			return { success: true, newLineIndex: proof.provideProvedLine(newLine, lineIndex) }
		} else if (proof.level.meta.logicSystem.getUnlockedLogicAxioms(proof.level).some(logicAxiom => logicAxiom.formula.equals(formula))) {
			const newLine: ProvedFormulaLine = new ProvedFormulaLine(formula, new ByLogicAxiom());
			return { success: true, newLineIndex: proof.provideProvedLine(newLine, lineIndex) }
		} else return { success: false, errorMessage: `Formula $${formula.toLatex()}$ is not an axiom.` };
	}
}

export class DeductionCommand extends ProofCommand {
	formula: Formula | number;
	constructor(formula: Formula | number) {
		super([{ type: "level", chapterId: "00_propositional_logic", levelId: "00_axiom" }]);
		this.formula = formula;
	}
	override excecute(proof: Proof, lineIndex: number): Partial<ExcecutionResult> {
		let formula: Formula;
		if (this.formula instanceof Formula) formula = this.formula;
		else if (0 <= this.formula && this.formula < proof.lines.length) {
			const proofLine: ProofLine = proof.lines[this.formula];
			const provedFormula: Formula | null = proofLine.getProvedFormula();
			if (provedFormula != null) formula = provedFormula;
			else return { success: false, errorMessage: `Line ${this.formula} does not prove any formula.` }
		}
		else return { success: false, errorMessage: `Line ${this.formula} does not exist in the proof.` };

		if (formula instanceof Implies) {
			const phi = formula.phi;
			const psi = formula.psi;

			if (!proof.lines.slice(0, lineIndex).some(line => {
				const lineFormula: Formula | null = line.getProvedFormula();
				return lineFormula != null && lineFormula.equals(phi);
			})) {
				proof.lines.splice(lineIndex, 0, new UnprovedFormulaLine(phi));
				lineIndex++;
			}
			if (!proof.lines.slice(0, lineIndex).some(line => {
				const lineFormula: Formula | null = line.getProvedFormula();
				return lineFormula != null && lineFormula.equals(formula);
			})) {
				proof.lines.splice(lineIndex, 0, new UnprovedFormulaLine(formula));
				lineIndex++;
			}

			const newLine: ProvedFormulaLine = new ProvedFormulaLine(psi, new ByDeduction(formula));
			return { success: true, newLineIndex: proof.provideProvedLine(newLine, lineIndex) }
		} else return { success: false, errorMessage: `The formula $${formula.toLatex()}$ is not of the form $\\varphi\\implies\\psi$.` }
	}
}

export class SubstitutionCommand extends ProofCommand {
	formula: Formula | number;
	atomicFormula: Formula;
	replacement: Formula;
	constructor(formula: Formula | number, atomicFormula: Formula, replacement: Formula) {
		super([{ type: "level", chapterId: "00_propositional_logic", levelId: "02_association" }]);
		this.formula = formula;
		this.atomicFormula = atomicFormula;
		this.replacement = replacement;
	}
	override excecute(proof: Proof, lineIndex: number): Partial<ExcecutionResult> {
		let formula: Formula;
		if (this.formula instanceof Formula) formula = this.formula;
		else if (0 <= this.formula && this.formula < proof.lines.length) {
			const proofLine: ProofLine = proof.lines[this.formula];
			const provedFormula: Formula | null = proofLine.getProvedFormula();
			if (provedFormula != null) formula = provedFormula;
			else return { success: false, errorMessage: `Line ${this.formula} does not prove any formula.` }
		}
		else return { success: false, errorMessage: `Line ${this.formula} does not exist in the proof.` };

		if (this.atomicFormula instanceof AtomicFormula) {
			if (!proof.lines.slice(0, lineIndex).some(line => {
				const lineFormula: Formula | null = line.getProvedFormula();
				return lineFormula != null && lineFormula.equals(formula);
			})) {
				proof.lines.splice(lineIndex, 0, new UnprovedFormulaLine(formula));
				lineIndex++;
			}

			const newLine: ProvedFormulaLine = new ProvedFormulaLine(formula.replaceAtomicFormula(this.atomicFormula, this.replacement), new BySubstitution(formula, this.atomicFormula, this.replacement));
			return { success: true, newLineIndex: proof.provideProvedLine(newLine, lineIndex) }
		} else return { success: false, errorMessage: `The formula $${this.atomicFormula.toLatex()}$ is not an atomic formula.` }
	}
}