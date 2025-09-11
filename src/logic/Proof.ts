import { AtomicFormula, Implies, type Formula } from "./Formula";
import type { Level } from "./Level";
import { parseCommand, parseFormula } from "./Parser";
import type { ExcecutionResult, ProofCommand } from "./ProofCommand";
import { isHardUnlocked } from "./Unlockables";

class Proof {
	level: Level;
	axioms: Formula[];
	target: Formula;

	lines: ProofLine[];

	constructor(level: Level, axioms: Formula[], target: Formula, lines: ProofLine[] | null, json: { type: string }[] | null) {
		this.level = level;
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
		this.lines.splice(lineIndex, 0, provedLine);
		this.lines = this.lines.filter((formulaLine, index) => !(index > lineIndex && formulaLine instanceof UnprovedFormulaLine && formulaLine.formula.equals(provedLine.formula)))
		return Math.min(lineIndex + 1, this.lines.length - 1);
	}
	excecute(input: string, lineIndex: number): Partial<ExcecutionResult> {
		try {
			const command: ProofCommand = parseCommand(input);
			if (isHardUnlocked(command, this.level)) return command.excecute(this, lineIndex);
			else return { success: false, errorMessage: "The command is not unlocked. "}
		} catch (error) {
			if (error instanceof Error) {
				console.log(error);
				return { success: false, errorMessage: error.toString() };
			}
			else return { success: false, errorMessage: "unknown error happened." };
		}
	}
	remove(lineIndex: number): number {
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
			if (!this.isFormulaRequired(currentLine.formula, lineIndex)) {
				this.lines.splice(lineIndex, 1);
			}
		}
		return Math.min(lineIndex, this.lines.length - 1);
	}
	isFormulaRequired(formula: Formula, startIndex: number) {
		for (let index: number = 0; index < startIndex; index++) {
			const provedFormula: Formula | null = this.lines[index].getProvedFormula();
			if (provedFormula != null && provedFormula.equals(formula)) return false;
		}
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
			return new UnprovedFormulaLine(parseFormula((jsonObject as any).formula));
		}
		else if (jsonObject.type === "ProvedFormulaLine") {
			const deductionMethod: DeductionMethod | null = this.deductionMethodFromJsonObject((jsonObject as any).deductionMethod);
			if (deductionMethod != null) return new ProvedFormulaLine(parseFormula((jsonObject as any).formula), deductionMethod);
		}
		return null;
	}
	deductionMethodFromJsonObject(jsonObject: { type: string }): DeductionMethod | null {
		if (jsonObject.type === "ByAxiom") {
			return new ByAxiom();
		} else if (jsonObject.type === "ByDeduction") {
			return new ByDeduction(parseFormula((jsonObject as any).formula));
		} else if (jsonObject.type === "BySubstitution") {
			return new BySubstitution(parseFormula((jsonObject as any).formula), parseFormula((jsonObject as any).atomicFormula) as AtomicFormula, parseFormula((jsonObject as any).replacement));
		} else return null;
	}
	copy(): Proof {
		return new Proof(this.level, this.axioms, this.target, this.lines, null);
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

export class BySubstitution extends DeductionMethod {
	formula: Formula;
	atomicFormula: AtomicFormula;
	replacement: Formula;
	constructor(formula: Formula, atomicFormula: AtomicFormula, replacement: Formula) {
		super();
		this.formula = formula;
		this.atomicFormula = atomicFormula;
		this.replacement = replacement;
	}
	formulaIndex(proof: Proof): number {
		return proof.lines.findIndex(line => {
			const formula: Formula | null = line.getProvedFormula();
			return formula != null && formula.equals(this.formula);
		});
	}
	validate(proof: Proof, index: number): boolean {
		const formulaLine: ProvedFormulaLine = proof.lines[index] as ProvedFormulaLine;
		const formulaIndex = this.formulaIndex(proof);
		return formulaIndex >= 0 && formulaIndex < index && formulaLine.formula.equals(this.formula.replaceAtomicFormula(this.atomicFormula, this.replacement));
	}
	key(): string {
		return "BySubstitution/" + this.formula.toCode() + "/" + this.atomicFormula.toCode() + "/" + this.replacement.toCode();
	}
	getShortDescription(localizer: (key: string, content: {}) => string, proof: Proof): string {
		const formulaIndex = this.formulaIndex(proof);
		return localizer("DeductionMethod.BySubstitution.ShortDescription", { formulaIndex: formulaIndex, atomicFormula: this.atomicFormula.toLatex() });
	}
	getLongDescription(localizer: (key: string, content: {}) => string, proof: Proof): string {
		const formulaIndex = this.formulaIndex(proof);
		return localizer("DeductionMethod.BySubstitution.LongDescription", { formulaIndex: formulaIndex, atomicFormula: this.atomicFormula.toLatex(), replacement: this.replacement.toLatex() });
	}
	getRequiredFormulas(): Formula[] {
		return [this.formula];
	}
	toJsonObject(): {} {
		return {
			type: "BySubstitution",
			formula: this.formula.toCode(),
			atomicFormula: this.atomicFormula.toCode(),
			replacement: this.replacement.toCode()
		};
	}
}

export default Proof;