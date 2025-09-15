import { createToken, CstParser, Lexer, type CstNode, type IToken } from "chevrotain"
import { AxiomCommand, AxiomSchemaCommand, DeductionCommand, SubstitutionCommand, type ProofCommand } from "./ProofCommand";
import { AtomicFormula, Formula, Implies, Not } from "./Formula";

// general
export const WhiteSpaceToken = createToken({ name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED });
export const LeftParenthesisToken = createToken({ name: "LeftParen", pattern: /\(/ });
export const RightParenthesisToken = createToken({ name: "RightParen", pattern: /\)/ });
// commands
export const AxiomToken = createToken({ name: "Axiom", pattern: /(axiom|axi)/ });
export const DeductionToken = createToken({ name: "Deduction", pattern: /(deduction|ded)/ });
export const SubstitutionToken = createToken({ name: "Substitution", pattern: /(substitution|sub)/ });
// logic operators
export const ImpliesToken = createToken({ name: "Implies", pattern: /->/ });
export const NotToken = createToken({ name: "Not", pattern: /!/ });
// vars
export const IdentifierToken = createToken({ name: "Identifier", pattern: /[a-zA-Z0-9_^{}\\]+/ });
export const LineToken = createToken({ name: "Line", pattern: /\$[0-9]+/ });
export const ReferenceToken = createToken({ name: "Reference", pattern: /\$[a-zA-Z][a-zA-Z0-9_]*/ });
// collection
export const Tokens = [WhiteSpaceToken, LeftParenthesisToken, RightParenthesisToken, AxiomToken, DeductionToken, SubstitutionToken, ImpliesToken, NotToken, IdentifierToken, LineToken, ReferenceToken];

let lexer: Lexer | null = null;
let parser: Parser | null = null;
let visitor: Visitor | null = null;

function getLexer() {
	if (!lexer) lexer = new Lexer(Tokens);
	return lexer;
}

class Parser extends CstParser {
	constructor() {
		super(Tokens);
		this.performSelfAnalysis();
	}
	formula = this.RULE("formula", () => {
		this.SUBRULE(this.implies);
	});
	private implies = this.RULE("implies", () => {
		this.SUBRULE(this.unary);
		this.OPTION(() => {
			this.CONSUME(ImpliesToken);
			this.SUBRULE(this.implies);
		})
	});
	private unary = this.RULE("unary", () => {
		this.OR([
			{ ALT: () => this.SUBRULE(this.atomicFormula) },
			{ ALT: () => this.SUBRULE(this.not) },
			{ ALT: () => this.SUBRULE(this.parenthesizedFormula) }
		]);
	});
	private atomicFormula = this.RULE("atomicFormula", () => {
		this.CONSUME(IdentifierToken);
	});
	private not = this.RULE("not", () => {
		this.CONSUME(NotToken);
		this.SUBRULE(this.formula);
	});
	private parenthesizedFormula = this.RULE("parenthesizedFormula", () => {
		this.CONSUME(LeftParenthesisToken);
		this.SUBRULE(this.formula);
		this.CONSUME(RightParenthesisToken);
	});
	command = this.RULE("command", () => {
		this.OR([
			{ ALT: () => this.SUBRULE(this.axiom) },
			{ ALT: () => this.SUBRULE(this.deduction) },
			{ ALT: () => this.SUBRULE(this.axiomSchema) },
			{ ALT: () => this.SUBRULE(this.substitution) }
		]);
	});
	private axiom = this.RULE("axiom", () => {
		this.CONSUME(AxiomToken);
		this.OR([
			{ ALT: () => this.CONSUME(LineToken) },
			{ ALT: () => this.SUBRULE(this.formula) }
		]);
	});
	private deduction = this.RULE("deduction", () => {
		this.CONSUME(DeductionToken);
		this.OR([
			{ ALT: () => this.CONSUME(LineToken) },
			{ ALT: () => this.SUBRULE(this.formula) }
		]);
	});
	private axiomSchema = this.RULE("axiomSchema", () => {
		this.CONSUME(AxiomToken);
		this.CONSUME(ReferenceToken);
		this.AT_LEAST_ONE(() => this.SUBRULE(this.formula));
	});
	private substitution = this.RULE("substitution", () => {
		this.CONSUME(SubstitutionToken);
		this.OR([
			{ ALT: () => this.CONSUME(LineToken) },
			{ ALT: () => this.SUBRULE1(this.formula) }
		]);
		this.SUBRULE2(this.formula, { LABEL: "atomicFormula" });
		this.SUBRULE3(this.formula, { LABEL: "replacement" });
	});
}

function getParser() {
	if (!parser) parser = new Parser();
	return parser;
}

export interface FormulaNode {
	implies: CstNode[];
}
export interface ImpliesNode {
	unary: CstNode[];
	implies?: CstNode[];
}
export interface UnaryNode {
	atomicFormula?: CstNode[];
	not?: CstNode[];
	parenthesizedFormula?: CstNode[];
}
export interface AtomicFormulaNode {
	Identifier: IToken[];
}
export interface NotNode {
	formula: CstNode[];
}
export interface ParenthesizedFormulaNode {
	formula: CstNode[];
}
export interface CommandNode {
	axiom?: CstNode[];
	deduction?: CstNode[];
	axiomSchema?: CstNode[];
	substitution?: CstNode[];
}
export interface AxiomNode {
	Line?: IToken[];
	formula?: CstNode[];
}
export interface DeductionNode {
	Line?: IToken[];
	formula?: CstNode[];
}
export interface AxiomSchemaNode {
	Reference: IToken[];
	formula: CstNode[];
}
export interface SubstitutionNode {
	Line?: IToken[];
	formula?: CstNode[];
	atomicFormula: CstNode[];
	replacement: CstNode[];
}

class Visitor extends getParser().getBaseCstVisitorConstructorWithDefaults() {
	constructor() {
		super();
		this.validateVisitor();
	}

	formula(ctx: FormulaNode): Formula {
		return this.visit(ctx.implies[0]);
	}
	implies(ctx: ImpliesNode): Formula {
		const left = this.visit(ctx.unary[0]) as Formula;
		if (ctx.implies != null) {
			const right = this.visit(ctx.implies[0]) as Formula;
			return new Implies(left, right);
		}
		else return left;
	}
	unary(ctx: UnaryNode): Formula {
		if (ctx.atomicFormula != null) return this.visit(ctx.atomicFormula[0]);
		else if (ctx.not != null) return this.visit(ctx.not[0]);
		else return this.visit(ctx.parenthesizedFormula!![0]);
	}
	atomicFormula(ctx: AtomicFormulaNode): Formula {
		return new AtomicFormula(ctx.Identifier[0].image);
	}
	not(ctx: NotNode): Formula {
		const formula = this.visit(ctx.formula[0]) as Formula;
		return new Not(formula);
	}
	parenthesizedFormula(ctx: ParenthesizedFormulaNode): Formula {
		const formula = this.visit(ctx.formula[0]) as Formula;
		return formula;
	}
	command(ctx: CommandNode): ProofCommand {
		if (ctx.axiom != null) return this.visit(ctx.axiom[0]);
		else if (ctx.deduction != null) return this.visit(ctx.deduction[0]);
		else if (ctx.axiomSchema != null) return this.visit(ctx.axiomSchema[0]);
		else return this.visit(ctx.substitution!![0]);
	}
	axiom(ctx: AxiomNode): ProofCommand {
		if (ctx.Line != null) {
			const lineNumber = parseInt(ctx.Line[0].image.substring(1));
			return new AxiomCommand(lineNumber);
		}
		else {
			const formula = this.visit(ctx.formula!![0]) as Formula;
			return new AxiomCommand(formula);
		}
	}
	deduction(ctx: AxiomNode): ProofCommand {
		if (ctx.Line != null) {
			const lineNumber = parseInt(ctx.Line[0].image.substring(1));
			return new DeductionCommand(lineNumber);
		}
		else {
			const formula = this.visit(ctx.formula!![0]) as Formula;
			return new DeductionCommand(formula);
		}
	}
	axiomSchema(ctx: AxiomSchemaNode): ProofCommand {
		const name = ctx.Reference[0].image.substring(1);
		const formulas: Formula[] = ctx.formula.map(f => this.visit(f) as Formula);
		return new AxiomSchemaCommand(name, formulas);
	}
	substitution(ctx: SubstitutionNode): ProofCommand {
		const atomicFormula: Formula = this.visit(ctx.atomicFormula[0]) as Formula;
		const replacement: Formula = this.visit(ctx.replacement[0]) as Formula;
		if (ctx.Line != null) {
			const lineNumber = parseInt(ctx.Line[0].image.substring(1));
			return new SubstitutionCommand(lineNumber, atomicFormula, replacement);
		}
		else {
			const formula = this.visit(ctx.formula!![0]) as Formula;
			return new SubstitutionCommand(formula, atomicFormula, replacement);
		}
	}
}

function getVisitor() {
	if (!visitor) visitor = new Visitor();
	return visitor;
}

export function parseCommand(input: string): ProofCommand {
	const lexer = getLexer();
	const parser = getParser();
	const visitor = getVisitor();
	const lexResult = lexer.tokenize(input);
	if (lexResult.errors.length > 0) {
		throw new Error(`Lexing errors: ${lexResult.errors.map(e => e.message).join(", ")}`);
	}
	parser.input = lexResult.tokens;
	const parseResult = parser.command();
	if (parser.errors.length > 0) {
		throw new Error(`Parser errors: ${parser.errors.map(e => e.message).join(", ")}`);
	}
	const command: ProofCommand = visitor.visit(parseResult) as ProofCommand;
	return command;
}
export function parseFormula(input: string): Formula {
	const lexer = getLexer();
	const parser = getParser();
	const visitor = getVisitor();
	const lexResult = lexer.tokenize(input);
	if (lexResult.errors.length > 0) {
		throw new Error(`Lexing errors: ${lexResult.errors.map(e => e.message).join(", ")}`);
	}
	parser.input = lexResult.tokens;
	const parseResult = parser.formula();
	if (parser.errors.length > 0) {
		throw new Error(`Parser errors: ${parser.errors.map(e => e.message).join(", ")}`);
	}
	const formula: Formula = visitor.visit(parseResult) as Formula;
	return formula;
}