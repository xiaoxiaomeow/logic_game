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
			const conclusionLine = new FormulaLine(target);
			this.lines = [conclusionLine];
		}
		else {
			this.lines = lines;
		}
	}
	validate() {
		console.log("validate");
		console.log(this.lines.every(line => line.validate(this)));
		return this.lines.every(line => line.validate(this));
	}
	excecute(command: string, lineIndex: number): ExcecutionResult {
		try {
			const currentLine: FormulaLine = this.lines[lineIndex] as FormulaLine;
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
	copy(): Proof {
		return new Proof(this.logicSystem, this.axioms, this.target, this.lines);
	}
}

export abstract class ProofLine {
	abstract validate(proof: Proof): boolean;
	abstract key(): string;
	abstract getLineDescription(): string;
	abstract getQuotedLines(): number[];
}

export class FormulaLine extends ProofLine {
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
		return "This formula is not proved yet. It just serves as a hint for what you need to prove around this line.";
	}
	getQuotedLines(): number[] {
		return [];
	}
}

export class ProvedFormulaLine extends FormulaLine {
	deductionMethod: DeductionMethod;
	constructor(formula: Formula, deductionMethod: DeductionMethod) {
		super(formula);
		this.deductionMethod = deductionMethod;
	}
	override validate(proof: Proof): boolean {
		return this.deductionMethod.validate(proof, this);
	}
	key(): string {
		return typeof (this) + "/" + this.formula.toCode() + "/" + this.deductionMethod.key();
	}
	override getLineDescription(): string {
		return this.deductionMethod.getLongDescription();
	}
	override getQuotedLines(): number[] {
		return [];
	}
}

export abstract class DeductionMethod {
	abstract validate(proof: Proof, formulaLine: ProvedFormulaLine): boolean;
	abstract key(): string;
	abstract getShortDescription(): string;
	abstract getLongDescription(): string;
	abstract getQuotedLines(): number[];
}

export class ByAxiom extends DeductionMethod {
	validate(proof: Proof, formulaLine: ProvedFormulaLine): boolean {
		return proof.axioms.some(axiom => axiom.equals(formulaLine.formula));
	}
	key(): string {
		return typeof (this);
	}
	getShortDescription(): string {
		return "by Axiom";
	}
	getLongDescription(): string {
		return "This formula is an Axiom.";
	}
	getQuotedLines(): number[] {
		return [];
	}
}

export default Proof;