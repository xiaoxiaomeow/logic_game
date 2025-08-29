import { useUIStore } from "@/contexts/UIStore";
import type { Formula } from "@/logic/LogicSystem";
import { Box, Flex, HStack, ListItem, ListRoot, Text, VStack } from "@chakra-ui/react";
import { FaAngleLeft, FaAngleRight, FaRegCopy, FaRegCircleCheck } from "react-icons/fa6";
import FormulaLatex from "./FormulaLatex";
import { useState } from "react";
import MarkdownWithLatex from "./MarkdownWithLatex";

function FormulaInspector() {
	const formulas: Formula[] = useUIStore(state => state.formulas);
	const inspectingIndex: number = useUIStore(state => state.inspectingIndex);
	const previousFormula: () => void = useUIStore(state => state.previousFormula);
	const nextFormula: () => void = useUIStore(state => state.nextFormula);
	const [copied, setCopied] = useState(false);
	return (
		<VStack width="100%" background="logic.subtle" gap="0">
			<Flex width="100%" alignItems="center" justifyContent="space-between" padding="4px 4px" background="logic.emphasized">
				<FaAngleLeft onClick={event => { previousFormula(); event.stopPropagation(); }} visibility={inspectingIndex > 0 ? "visible" : "hidden"} />
				<Text padding="auto">Formula Inspector</Text>
				<FaAngleRight onClick={event => { nextFormula(); event.stopPropagation(); }} visibility={inspectingIndex < formulas.length - 1 ? "visible" : "hidden"} />
			</Flex>
			<VStack width="100%" padding="8px 8px">{
				inspectingIndex === -1 ? <Text>Click on some formula to inspect it.</Text> : (() => {
					const displayingFormula: Formula = formulas[inspectingIndex];
					const subFormulas: Formula[] = displayingFormula.getSubformulas();
					const onCopyClick: () => void = async () => {
						await navigator.clipboard.writeText(displayingFormula.toCode());
						setCopied(true);
						await new Promise(resolve => setTimeout(resolve, 1000));
						setCopied(false);
					}
					return (<>
						<HStack width="100%">
							<Text fontWeight="bold">Formula</Text>
							<FormulaLatex formula={displayingFormula} />
						</HStack>
						<HStack width="100%">
							<Text fontWeight="bold">Description</Text>
							<Text color="logic.fg">{displayingFormula.toDescription()}</Text>
						</HStack>
						<HStack width="100%" alignItems="center">
							<Text fontWeight="bold">Code</Text>
							{copied ? <FaRegCircleCheck /> : <FaRegCopy onClick={event => { onCopyClick(); event.stopPropagation(); }} />}
							<code>{displayingFormula.toCode()}</code>
						</HStack>
						<Box width="100%">
							<MarkdownWithLatex>{displayingFormula.getFormulaDescription()}</MarkdownWithLatex>
						</Box>
						<ListRoot width="100%">
							{subFormulas.map(formula => (
								<ListItem key={formula.toCode()}>
									<FormulaLatex formula={formula} />
								</ListItem>
							))}
						</ListRoot>
					</>);
				})()
			}</VStack>
		</VStack>
	);
}

export default FormulaInspector;