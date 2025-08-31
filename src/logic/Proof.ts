import type { Formula, LogicSystem } from "./LogicSystem";
import { Implies } from "./PropositionalLogic";
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
		return this.lines.every((line, index) => line.validate(this, index)) && this.lines.some(line => {
			const formula: Formula | null = line.getProvedFormula();
			return formula != null && formula.equals(this.target);
		});
	}
	proofComplete(): boolean {
		return this.validate() && this.lines.every(line => !(line instanceof UnprovedFormulaLine));
	}
	provideProvedLine(provedLine: ProvedFormulaLine, lineIndex: number): number {
		const currentLine: UnprovedFormulaLine = this.lines[lineIndex] as UnprovedFormulaLine;
		if (currentLine.formula.equals(provedLine.formula)) {
			this.lines[lineIndex] = provedLine;
			return lineIndex;
		}
		else {
			this.lines.splice(lineIndex, 0, provedLine);
			return lineIndex + 1;
		}

	}
	excecute(command: string, lineIndex: number): ExcecutionResult {
		try {
			const segments: string[] = TokenizeCommand(command);
			const commandWord = segments[0];
			if (commandWord === "axiom") {
				const formula: Formula = this.logicSystem.parseFormula(segments[1]);
				if (this.axioms.some(axiom => axiom.equals(formula))) {
					const newLine: ProvedFormulaLine = new ProvedFormulaLine(formula, new ByAxiom());
					return { success: true, errorMessage: null, newLineIndex: this.provideProvedLine(newLine, lineIndex) }
				} else return { success: false, errorMessage: segments[1] + " is not an axiom.", newLineIndex: null };
			} else if (commandWord === "deduction") {
				const targetLineNumber: number = parseInt(segments[1]);
				if (targetLineNumber >= lineIndex) return { success: false, errorMessage: "cannot refer to a future line.", newLineIndex: null };
				const targetLine: ProofLine = this.lines[targetLineNumber];
				const formula: Formula | null = targetLine.getProvedFormula();
				if (formula instanceof Implies) {
					const phi = formula.phi;
					const psi = formula.psi;
					if (this.lines.slice(0, lineIndex).some(line => {
						const lineFormula: Formula | null = line.getProvedFormula();
						return lineFormula != null && lineFormula.equals(phi);
					})) {
						const newLine: ProvedFormulaLine = new ProvedFormulaLine(psi, new ByDeduction(formula));
						return { success: true, errorMessage: null, newLineIndex: this.provideProvedLine(newLine, lineIndex) }
					} else return { success: false, errorMessage: "Cannot find formula $\\varphi = " + phi.toLatex() + "$", newLineIndex: null }
				} else if (formula == null) return { success: false, errorMessage: "The indicated line does not prove any formula.", newLineIndex: null }
				else return { success: false, errorMessage: "The formula " + formula.toLatex() + " is not of the form $\\varphi\\implies\\psi$.", newLineIndex: null }
			} else return { success: false, errorMessage: "unknown command " + commandWord + ".", newLineIndex: null };
		} catch (error) {
			if (error instanceof Error) return { success: false, errorMessage: error.toString(), newLineIndex: null };
			else return { success: false, errorMessage: "unknown error happened.", newLineIndex: null };
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
		} else if (jsonObject.type === "ByDeduction") {
			return new ByDeduction(this.logicSystem.parseFormula((jsonObject as any).formula));
		} else return null;
	}
	copy(): Proof {
		return new Proof(this.logicSystem, this.axioms, this.target, this.lines, null);
	}
}

export abstract class ProofLine {
	abstract validate(proof: Proof, index: number): boolean;
	abstract key(): string;
	abstract getLineDescription(localizer: (key: string, content: {}) => string, proof: Proof): string;
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
	validate(_: Proof, _index: number): boolean {
		return true;
	}
	key(): string {
		return "UnprovedFormulaLine/" + this.formula.toCode();
	}
	getLineDescription(localizer: (key: string, content: {}) => string, _: Proof): string {
		return localizer("ProofLine.FormulaLine.Description", {});
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
	validate(proof: Proof, index: number): boolean {
		return this.deductionMethod.validate(proof, index);
	}
	key(): string {
		return "ProvedFormulaLine/" + this.formula.toCode() + "/" + this.deductionMethod.key();
	}
	getLineDescription(localizer: (key: string, content: {}) => string, proof: Proof): string {
		return this.deductionMethod.getLongDescription(localizer, proof);
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
	abstract validate(proof: Proof, index: number): boolean;
	abstract key(): string;
	abstract getShortDescription(localizer: (key: string, content: {}) => string, proof: Proof): string;
	abstract getLongDescription(localizer: (key: string, content: {}) => string, proof: Proof): string;
	abstract getRequiredFormulas(): Formula[];
	abstract toJsonObject(): {};
}

export class ByAxiom extends DeductionMethod {
	validate(proof: Proof, index: number): boolean {
		const formulaLine: ProvedFormulaLine = proof.lines[index] as ProvedFormulaLine;
		return proof.axioms.some(axiom => axiom.equals(formulaLine.formula));
	}
	key(): string {
		return "ByAxiom";
	}
	getShortDescription(localizer: (key: string, content: {}) => string, _: Proof): string {
		return localizer("DeductionMethod.ByAxiom.ShortDescription", {});
	}
	getLongDescription(localizer: (key: string, content: {}) => string, _: Proof): string {
		return localizer("DeductionMethod.ByAxiom.LongDescription", {});
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

export class ByDeduction extends DeductionMethod {
	implies: Formula;
	constructor(implies: Formula) {
		super();
		this.implies = implies;
	}
	impliesIndex(proof: Proof): number {
		return proof.lines.findIndex(line => {
			const formula: Formula | null = line.getProvedFormula();
			return formula != null && formula.equals(this.implies);
		});
	}
	phiIndex(proof: Proof): number {
		if (this.implies instanceof Implies) {
			const phi: Formula = this.implies.phi;
			return proof.lines.findIndex(line => {
				const formula: Formula | null = line.getProvedFormula();
				return formula != null && formula.equals(phi);
			});
		}
		else return -1;
	}
	validate(proof: Proof, index: number): boolean {
		if (this.implies instanceof Implies) {
			const formulaLine: ProvedFormulaLine = proof.lines[index] as ProvedFormulaLine;
			const impliesIndex = this.impliesIndex(proof);
			const phiIndex = this.phiIndex(proof);
			return impliesIndex >= 0 && impliesIndex < index && phiIndex >= 0 && phiIndex < index && formulaLine.formula.equals(this.implies.psi);
		} else return false;
	}
	key(): string {
		return "ByDeduction/" + this.implies.toCode();
	}
	getShortDescription(localizer: (key: string, content: {}) => string, proof: Proof): string {
		const impliesIndex = this.impliesIndex(proof);
		const phiIndex = this.phiIndex(proof);
		return localizer("DeductionMethod.ByDeduction.ShortDescription", { impliesIndex: impliesIndex, phiIndex: phiIndex });
	}
	getLongDescription(localizer: (key: string, content: {}) => string, proof: Proof): string {
		const impliesIndex = this.impliesIndex(proof);
		const phiIndex = this.phiIndex(proof);
		return localizer("DeductionMethod.ByDeduction.LongDescription", { impliesIndex: impliesIndex, phiIndex: phiIndex });
	}
	getRequiredFormulas(): Formula[] {
		if (this.implies instanceof Implies) {
			const phi: Formula = this.implies.phi;
			return [this.implies, phi];
		}
		else return [this.implies];
	}
	toJsonObject(): {} {
		return {
			type: "ByDeduction",
			formula: this.implies.toCode()
		};
	}
}

export default Proof;