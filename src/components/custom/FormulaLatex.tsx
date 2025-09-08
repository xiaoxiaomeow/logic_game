import type { Formula } from "@/logic/Formula";
import { InlineMath, BlockMath } from 'react-katex';
import { Box } from "@chakra-ui/react";
import type { MouseEventHandler } from "react";
import { useUIStore } from "@/contexts/UIStore";

export interface FormulaInput {
	formula: Formula;
	block?: boolean;
	vague?: boolean;
}

function FormulaLatex(props: FormulaInput) {
	const inspect = useUIStore(state => state.inspect);
	const onClick: MouseEventHandler = event => {
		inspect(props.formula);
		event.stopPropagation();
	}
	return (
		<Box color={props.vague ? "logic.emphasized" : "logic.fg"} display="inline-block" onClick={onClick}>
			{props.block ? <BlockMath math={props.formula.toLatex()}></BlockMath> : <InlineMath math={props.formula.toLatex()}></InlineMath>}
		</Box>
	);
}

export default FormulaLatex;