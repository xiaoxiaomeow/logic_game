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

	constructor(logicSystem: LogicSystem, axioms: Formula[], target: Formula, lines: ProofLine[] | null, json: { type: string }[] | null) {
		this.logicSystem = logicSystem;
		this.axioms = axioms;
		this.target = target;
		if (lines != null) {
			this.lines = lines;
		}
		else if (json != null) {
			try {
				this.lines = json.map(jsonObject => this.proofLineFromJsonObject(jsonObject)).filter(line => line != null);
			} catch (error) {
				console.log(error);
				const conclusionLine = new UnprovedFormulaLine(target);
				this.lines = [conclusionLine];
			}
			if (!this.validate()) {
				const conclusionLine = new UnprovedFormulaLine(target);
				this.lines = [conclusionLine];
			}
		}
		else {
			const conclusionLine = new UnprovedFormulaLine(target);
			this.lines = [conclusionLine];
		}
	}
	validate(): boolean {
		return this.lines.every(line => line.validate(this)) && this.lines.some(line => {
			const formula: Formula | null = line.getProvedFormula();
			return formula != null && formula.equals(this.target);
		});
	}
	proofComplete(): boolean {
		return this.validate() && this.lines.every(line => !(line instanceof UnprovedFormulaLine));
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
	toJsonArray(): {}[] {
		return this.lines.map(line => line.toJsonObject());
	}
	proofLineFromJsonObject(jsonObject: { type: string }): ProofLine | null {
		if (jsonObject.type === "UnprovedFormulaLine") {
			return new UnprovedFormulaLine(this.logicSystem.parseFormula((jsonObject as any).formula));
		}
		else if (jsonObject.type === "ProvedFormulaLine") {
			const deductionMethod: DeductionMethod | null = this.deductionMethodFromJsonObject((jsonObject as any).deductionMethod);
			if (deductionMethod != null) return new ProvedFormulaLine(this.logicSystem.parseFormula((jsonObject as any).formula), deductionMethod);
		}
		return null;
	}
	deductionMethodFromJsonObject(jsonObject: { type: string }): DeductionMethod | null {
		if (jsonObject.type === "ByAxiom") {
			return new ByAxiom();
		}
		else return null;
	}
	copy(): Proof {
		return new Proof(this.logicSystem, this.axioms, this.target, this.lines, null);
	}
}

export abstract class ProofLine {
	abstract validate(proof: Proof): boolean;
	abstract key(): string;
	abstract getLineDescription(): string;
	abstract getProvedFormula(): Formula | null;
	abstract getRequiredFormulas(): Formula[];
	abstract toJsonObject(): {};
}

export class UnprovedFormulaLine extends ProofLine {
	formula: Formula;
	constructor(formula: Formula) {
		super();
		this.formula = formula;
	}
	validate(_: Proof): boolean {
		return true;
	}
	key(): string {
		return "UnprovedFormulaLine/" + this.formula.toCode();
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
	toJsonObject(): {} {
		return {
			type: "UnprovedFormulaLine",
			formula: this.formula.toCode()
		};
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
		return "ProvedFormulaLine/" + this.formula.toCode() + "/" + this.deductionMethod.key();
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
	toJsonObject(): {} {
		return {
			type: "ProvedFormulaLine",
			formula: this.formula.toCode(),
			deductionMethod: this.deductionMethod.toJsonObject()
		};
	}
}

export abstract class DeductionMethod {
	abstract validate(proof: Proof, formulaLine: ProvedFormulaLine): boolean;
	abstract key(): string;
	abstract getShortDescription(): string;
	abstract getLongDescription(): string;
	abstract getRequiredFormulas(): Formula[];
	abstract toJsonObject(): {};
}

export class ByAxiom extends DeductionMethod {
	validate(proof: Proof, formulaLine: ProvedFormulaLine): boolean {
		return proof.axioms.some(axiom => axiom.equals(formulaLine.formula));
	}
	key(): string {
		return "ByAxiom";
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
	toJsonObject(): {} {
		return {
			type: "ByAxiom"
		};
	}
}

export default Proof;