export abstract class Formula {
	abstract operatorPriority(): number;
	abstract replaceAtomicFormula(atomicFormula: AtomicFormula, replacement: Formula): Formula;
	abstract toCode(): string;
	toCodeWithBracket(parentOperatorPriority: number): string {
		if (this.operatorPriority() > parentOperatorPriority) return this.toCode();
		else return "(" + this.toCode() + ")";
	};
	abstract toLatex(): string;
	toLatexWithBracket(parentOperatorPriority: number): string {
		if (this.operatorPriority() > parentOperatorPriority) return this.toLatex();
		else return "(" + this.toLatex() + ")";
	};
	abstract toDescription(localizer: (key: string, content: {}) => string): string;
	toDescriptionWithBracket(localizer: (key: string, content: {}) => string, parentOperatorPriority: number): string {
		if (this.operatorPriority() > parentOperatorPriority) return this.toDescription(localizer);
		else return "(" + this.toDescription(localizer) + ")";
	};
	abstract getFormulaDescription(): string;
	abstract getSubformulas(): Formula[];
	abstract equals(other: Formula): boolean;
}
export class Implies extends Formula {
	phi: Formula;
	psi: Formula;
	constructor(phi: Formula, psi: Formula) {
		super();
		this.phi = phi;
		this.psi = psi;
	}
	replaceAtomicFormula(atomicFormula: AtomicFormula, replacement: Formula): Formula {
		return new Implies(this.phi.replaceAtomicFormula(atomicFormula, replacement), this.psi.replaceAtomicFormula(atomicFormula, replacement));
	}
	operatorPriority(): number {
		return 10;
	}
	toCode(): string {
		return this.phi.toCodeWithBracket(this.operatorPriority()) + "->" + this.psi.toCodeWithBracket(this.operatorPriority() - 1);
	}
	toLatex(): string {
		return this.phi.toLatexWithBracket(this.operatorPriority()) + " \\to " + this.psi.toLatexWithBracket(this.operatorPriority() - 1);
	}
	toDescription(localizer: (key: string, content: {}) => string): string {
		return localizer("Formula.Implies.Description", {
			phi: this.phi.toDescriptionWithBracket(localizer, this.operatorPriority()),
			psi: this.psi.toDescriptionWithBracket(localizer, this.operatorPriority())
		});
	}
	getFormulaDescription(): string {
		return "Formula.Implies.FormulaDescription";
	}
	getSubformulas(): Formula[] {
		return [this.phi, this.psi];
	}
	isImplies(obj: unknown): obj is Implies {
		return obj instanceof Implies;
	}
	equals(other: Formula): boolean {
		if (!this.isImplies(other)) return false;
		const otherFormula: Implies = other as Implies
		return this.phi.equals(otherFormula.phi) && this.psi.equals(otherFormula.psi);
	}
}
export class Not extends Formula {
	phi: Formula;
	constructor(phi: Formula) {
		super();
		this.phi = phi;
	}
	replaceAtomicFormula(atomicFormula: AtomicFormula, replacement: Formula): Formula {
		return new Not(this.phi.replaceAtomicFormula(atomicFormula, replacement));
	}
	operatorPriority(): number {
		return 20;
	}
	toCode(): string {
		return "!" + this.phi.toCodeWithBracket(this.operatorPriority() - 1);
	}
	toLatex(): string {
		return "\\lnot " + this.phi.toLatexWithBracket(this.operatorPriority() - 1);
	}
	toDescription(localizer: (key: string, content: {}) => string): string {
		return localizer("Formula.Not.Description", {
			phi: this.phi.toDescriptionWithBracket(localizer, this.operatorPriority())
		});
	}
	getFormulaDescription(): string {
		return "Formula.Not.FormulaDescription";
	}
	getSubformulas(): Formula[] {
		return [this.phi];
	}
	isNot(obj: unknown): obj is Not {
		return obj instanceof Not;
	}
	equals(other: Formula): boolean {
		if (!this.isNot(other)) return false;
		const otherFormula: Not = other as Not
		return this.phi.equals(otherFormula.phi);
	}
}
export class AtomicFormula implements Formula {
	variableName: string;
	constructor(variableName: string) {
		this.variableName = variableName;
	}
	replaceAtomicFormula(atomicFormula: AtomicFormula, replacement: Formula): Formula {
		if (atomicFormula.equals(this)) return replacement;
		else return this;
	}
	operatorPriority(): number {
		return 30;
	}
	toCode(): string {
		if (/[a-zA-Z][a-zA-Z0-9_^]*/.test(this.variableName)) return this.variableName;
		else return "'" + this.variableName + "'";
	}
	toCodeWithBracket(_: number): string {
		return this.toCode();
	}
	toLatex(): string {
		return this.variableName;
	}
	toLatexWithBracket(_: number): string {
		return this.variableName;
	}
	toDescription(): string {
		return "$" + this.variableName + "$";
	}
	toDescriptionWithBracket(_localizer: (key: string, content: {}) => string, _: number): string {
		return "$" + this.variableName + "$";
	}
	getFormulaDescription(): string {
		return "Formula.Atomic.FormulaDescription";
	}
	getSubformulas(): Formula[] {
		return [];
	}
	isAtomicFormula(obj: unknown): obj is AtomicFormula {
		return obj instanceof AtomicFormula;
	}
	equals(other: Formula): boolean {
		if (!this.isAtomicFormula(other)) return false;
		const otherFormula: AtomicFormula = other as AtomicFormula
		return this.variableName === otherFormula.variableName;
	}
}