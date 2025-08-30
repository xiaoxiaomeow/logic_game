import type { Formula, LogicSystem } from "./LogicSystem";
import { TokenizeCommand } from "./Token";

export interface ExcecutionResult {
	success: boolean;
	errorMessage: string | null;
	newLineIndex: number | null;
}

class Proof {
	logicSystem: LogicSystem;
	axioms: Formula[];
	target: Formula;

	lines: ProofLine[];

	constructor(logicSystem: LogicSystem, axioms: Formula[], target: Formula, lines: ProofLine[] | null) {
		this.logicSystem = logicSystem;
		this.axioms = axioms;
		this.target = target;
		if (lines == null) {
			const conclusionLine = new UnprovedFormulaLine(target);
			this.lines = [conclusionLine];
		}
		else {
			this.lines = lines;
		}
	}
	validate() {
		return this.lines.every(line => line.validate(this));
	}
	excecute(command: string, lineIndex: number): ExcecutionResult {
		try {
			const currentLine: UnprovedFormulaLine = this.lines[lineIndex] as UnprovedFormulaLine;
			const segments: string[] = TokenizeCommand(command);
			const commandWord = segments[0];
			if (commandWord === "axiom") {
				const formula: Formula = this.logicSystem.parseFormula(segments[1]);
				if (this.axioms.some(axiom => axiom.equals(formula))) {
					const newLine: ProvedFormulaLine = new ProvedFormulaLine(formula, new ByAxiom());
					if (currentLine.formula.equals(formula)) {
						this.lines[lineIndex] = newLine;
						return {
							success: true,
							errorMessage: null,
							newLineIndex: lineIndex
						};
					}
					else {
						this.lines.splice(lineIndex, 0, new ProvedFormulaLine(formula, new ByAxiom()));
						return {
							success: true,
							errorMessage: null,
							newLineIndex: lineIndex + 1
						};
					}
				} else return {
					success: false,
					errorMessage: segments[1] + " is not an axiom.",
					newLineIndex: null
				};
			} else return {
				success: false,
				errorMessage: "unknown command " + commandWord + ".",
				newLineIndex: null
			};
		} catch (error) {
			if (error instanceof Error) return {
				success: false,
				errorMessage: error.toString(),
				newLineIndex: null
			};
			else return {
				success: false,
				errorMessage: "unknown error happened.",
				newLineIndex: null
			};
		}
	}
	remove(lineIndex: number) {
		const currentLine: UnprovedFormulaLine = this.lines[lineIndex] as UnprovedFormulaLine;
		if (currentLine instanceof ProvedFormulaLine) {
			if (this.isFormulaRequired(currentLine.formula, lineIndex)) {
				this.lines[lineIndex] = new UnprovedFormulaLine(currentLine.formula);
			}
			else {
				this.lines.splice(lineIndex, 1);
			}
		}
		else if (currentLine instanceof UnprovedFormulaLine) {
			if (this.isFormulaRequired(currentLine.formula, lineIndex)) {
				return;
			}
			else {
				this.lines.splice(lineIndex, 1);
			}
		}
	}
	isFormulaRequired(formula: Formula, startIndex: number) {
		for (let index: number = startIndex + 1; index <= this.lines.length; index++) {
			let requiredFormulas: Formula[];
			let provedFormula: Formula | null;
			if (index == this.lines.length) {
				requiredFormulas = [this.target];
				provedFormula = null;
			}
			else {
				requiredFormulas = this.lines[index].getRequiredFormulas();
				provedFormula = this.lines[index].getProvedFormula();
			}
			if (requiredFormulas.some(requiredFormulas => formula.equals(requiredFormulas))) return true;
			if (provedFormula != null && provedFormula.equals(formula)) return false;
		}
		return false;
	}
	copy(): Proof {
		return new Proof(this.logicSystem, this.axioms, this.target, this.lines);
	}
}

export abstract class ProofLine {
	abstract validate(proof: Proof): boolean;
	abstract key(): string;
	abstract getLineDescription(): string;
	abstract getProvedFormula(): Formula | null;
	abstract getRequiredFormulas(): Formula[];
}

export class UnprovedFormulaLine extends ProofLine {
	formula: Formula;
	constructor(formula: Formula) {
		super();
		this.formula = formula;
	}
	validate(_: Proof): boolean {
		return false;
	}
	key(): string {
		return typeof (this) + "/" + this.formula.toCode();
	}
	getLineDescription(): string {
		return "ProofLine.FormulaLine.Description";
	}
	getProvedFormula(): Formula | null {
		return this.formula;
	}
	getRequiredFormulas(): Formula[] {
		return [];
	}
}

export class ProvedFormulaLine {
	formula: Formula;
	deductionMethod: DeductionMethod;
	constructor(formula: Formula, deductionMethod: DeductionMethod) {
		this.formula = formula;
		this.deductionMethod = deductionMethod;
	}
	validate(proof: Proof): boolean {
		return this.deductionMethod.validate(proof, this);
	}
	key(): string {
		return typeof (this) + "/" + this.formula.toCode() + "/" + this.deductionMethod.key();
	}
	getLineDescription(): string {
		return this.deductionMethod.getLongDescription();
	}
	getProvedFormula(): Formula | null {
		return this.formula;
	}
	getRequiredFormulas(): Formula[] {
		return this.deductionMethod.getRequiredFormulas();
	}
}

export abstract class DeductionMethod {
	abstract validate(proof: Proof, formulaLine: ProvedFormulaLine): boolean;
	abstract key(): string;
	abstract getShortDescription(): string;
	abstract getLongDescription(): string;
	abstract getRequiredFormulas(): Formula[];
}

export class ByAxiom extends DeductionMethod {
	validate(proof: Proof, formulaLine: ProvedFormulaLine): boolean {
		return proof.axioms.some(axiom => axiom.equals(formulaLine.formula));
	}
	key(): string {
		return typeof (this);
	}
	getShortDescription(): string {
		return "DeductionMethod.ByAxiom.ShortDescription";
	}
	getLongDescription(): string {
		return "DeductionMethod.ByAxiom.LongDescription";
	}
	getRequiredFormulas(): Formula[] {
		return [];
	}
}

export default Proof;