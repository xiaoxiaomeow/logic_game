import type { Formula, LogicSystem } from "./LogicSystem";
import { Tokenize } from "./Token";

export class PropositionalLogic<TAtomicFormula extends Formula> implements LogicSystem {
	atomicParser: (parser: PropositionalLogicFormulaParser<TAtomicFormula>) => TAtomicFormula;
	name: string;
	constructor(atomicParser: (parser: PropositionalLogicFormulaParser<TAtomicFormula>) => TAtomicFormula, name: string) {
		this.atomicParser = atomicParser;
		this.name = name;
	}
	parseFormula(code: string): PropositionalLogicFormula<TAtomicFormula> {
		const tokens = Tokenize(code);
		const parser: PropositionalLogicFormulaParser<TAtomicFormula> = new PropositionalLogicFormulaParser<TAtomicFormula>(tokens, this.atomicParser);
		return parser.get();
	}
}
class PropositionalLogicFormulaParser<TAtomicFormula extends Formula> {
	tokens: string[];
	position: number;
	atomicParser: (parser: PropositionalLogicFormulaParser<TAtomicFormula>) => TAtomicFormula;
	constructor(tokens: string[], atomicParser: (parser: PropositionalLogicFormulaParser<TAtomicFormula>) => TAtomicFormula) {
		this.tokens = tokens;
		this.position = 0;
		this.atomicParser = atomicParser;
	}
	get(): PropositionalLogicFormula<TAtomicFormula> {
		return this.parseImplies();
	}
	currentToken(): string {
		return this.position < this.tokens.length ? this.tokens[this.position] : '';
	}
	consume(expected: string): string {
		if (expected && this.currentToken() !== expected) throw new Error(`Expected ${expected}, found ${this.currentToken()}`);
		return this.tokens[this.position++];
	}
	parseHighestPriority(): PropositionalLogicFormula<TAtomicFormula> {
		return this.parseImplies();
	}
	parseImplies(): PropositionalLogicFormula<TAtomicFormula> {
		let left = this.parseNot();
		while (this.currentToken() === '->') {
			this.consume('->');
			const right = this.parseImplies();
			left = new Implies(left, right);
		}
		return left;
	}
	private parseNot(): PropositionalLogicFormula<TAtomicFormula> {
		if (this.currentToken() === '!') {
			this.consume('!');
			const operand = this.parseNot();
			return new Not(operand);
		}
		return this.parseAtom();
	}
	private parseAtom(): PropositionalLogicFormula<TAtomicFormula> {
		const token = this.currentToken();
		if (token === '(') {
			this.consume('(');
			const expr = this.parseHighestPriority();
			this.consume(')');
			return expr;
		}

		const atom = this.atomicParser(this);
		return atom;
	}
}
export abstract class PropositionalLogicFormula<_ extends Formula> implements Formula {
	abstract operatorPriority(): number;
	abstract toCode(): string;
	toCodeWithBracket(parentOperatorPriority: number): string {
		if (this.operatorPriority() >= parentOperatorPriority) return this.toCode();
		else return "(" + this.toCode() + ")";
	};
	abstract toLatex(): string;
	toLatexWithBracket(parentOperatorPriority: number): string {
		if (this.operatorPriority() > parentOperatorPriority) return this.toLatex();
		else return "(" + this.toLatex() + ")";
	};
	abstract toDescription(): string;
	toDescriptionWithBracket(parentOperatorPriority: number): string {
		if (this.operatorPriority() > parentOperatorPriority) return this.toDescription();
		else return "(" + this.toDescription() + ")";
	};
	abstract getFormulaDescription(): string;
	abstract getSubformulas(): Formula[];
	abstract equals(other: Formula): boolean;
}
export class Implies<TAtomicFormula extends Formula> extends PropositionalLogicFormula<TAtomicFormula> {
	phi: PropositionalLogicFormula<TAtomicFormula>;
	psi: PropositionalLogicFormula<TAtomicFormula>;
	constructor(phi: PropositionalLogicFormula<TAtomicFormula>, psi: PropositionalLogicFormula<TAtomicFormula>) {
		super();
		this.phi = phi;
		this.psi = psi;
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
	toDescription(): string {
		return "if " + this.phi.toDescriptionWithBracket(this.operatorPriority()) + " then " + this.psi.toDescriptionWithBracket(this.operatorPriority());
	}
	getFormulaDescription(): string {
		return "This formula is constructed by connecting the following formulas using $\\to$.";
	}
	getSubformulas(): Formula[] {
		return [this.phi, this.psi];
	}
	isImplies(obj: unknown): obj is Implies<TAtomicFormula> {
		return obj instanceof Implies;
	}
	equals(other: Formula): boolean {
		if (!this.isImplies(other)) return false;
		const otherFormula: Implies<TAtomicFormula> = other as Implies<TAtomicFormula>
		return this.phi.equals(otherFormula.phi) && this.psi.equals(otherFormula.psi);
	}
}
export class Not<TAtomicFormula extends Formula> extends PropositionalLogicFormula<TAtomicFormula> {
	phi: PropositionalLogicFormula<TAtomicFormula>;
	constructor(phi: PropositionalLogicFormula<TAtomicFormula>) {
		super();
		this.phi = phi;
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
	toDescription(): string {
		return "not " + this.phi.toDescriptionWithBracket(this.operatorPriority());
	}
	getFormulaDescription(): string {
		return "This formula is constructed by negating the following formula using $\\lnot$.";
	}
	getSubformulas(): Formula[] {
		return [this.phi];
	}
	isNot(obj: unknown): obj is Not<TAtomicFormula> {
		return obj instanceof Not;
	}
	equals(other: Formula): boolean {
		if (!this.isNot(other)) return false;
		const otherFormula: Not<TAtomicFormula> = other as Not<TAtomicFormula>
		return this.phi.equals(otherFormula.phi);
	}
}
export class AtomicFormula implements Formula {
	variableName: string;
	constructor(variableName: string) {
		this.variableName = variableName;
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
		return this.variableName;
	}
	toDescriptionWithBracket(_: number): string {
		return this.variableName;
	}
	getFormulaDescription(): string {
		return "This is an atomic formula with variable $" + this.variableName + "$.";
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

const PropositionalLogicWithAtomicFormula: LogicSystem = new PropositionalLogic<AtomicFormula>((parser: PropositionalLogicFormulaParser<AtomicFormula>) => {
	const token: string = parser.currentToken();
	parser.consume(token);
	return new AtomicFormula(token.replaceAll("'", ""));
}, "Propositional Logic");

export default PropositionalLogicWithAtomicFormula;