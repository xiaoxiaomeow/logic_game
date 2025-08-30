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
	toDescription(localizer: (key: string, content: {}) => string): string;
	toDescriptionWithBracket(localizer: (key: string, content: {}) => string, parentOperatorPriority: number): string;
	getFormulaDescription(): string;
	getSubformulas(): Formula[];
	equals(other: Formula): boolean;
}