export interface LogicSystem {
	parseFormula: (code: string) => Formula;
	name: string
}

export interface Term {

}

export interface Formula {
	operatorPriority(): number;
	toCode(): string;
	toCodeWithBracket(parentOperatorPriority: number): string;
	toLatex(): string;
	toLatexWithBracket(parentOperatorPriority: number): string;
	toDescription(): string;
	toDescriptionWithBracket(parentOperatorPriority: number): string;
	getFormulaDescription(): string;
	getSubformulas(): Formula[];
	equals(other: Formula): boolean;
}