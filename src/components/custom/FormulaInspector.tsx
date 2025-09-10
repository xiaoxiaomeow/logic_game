import { useUIStore } from "@/contexts/UIStore";
import { Box, Code, Flex, HStack, ListItem, ListRoot, Text, VStack } from "@chakra-ui/react";
import { FaAngleLeft, FaAngleRight, FaRegCopy, FaRegCircleCheck } from "react-icons/fa6";
import FormulaLatex from "./FormulaLatex";
import { useState } from "react";
import MarkdownWithLatex from "./MarkdownWithLatex";
import { useTranslation } from "react-i18next";
import type { Formula } from "@/logic/Formula";

function FormulaInspector() {
	const formulas: Formula[] = useUIStore(state => state.formulas);
	const inspectingIndex: number = useUIStore(state => state.inspectingIndex);
	const previousFormula: () => void = useUIStore(state => state.previousFormula);
	const nextFormula: () => void = useUIStore(state => state.nextFormula);
	const [copied, setCopied] = useState(false);
	const t = useTranslation().t;
	return (
		<VStack width="100%" background="logic.subtle" gap="0">
			<Flex width="100%" alignItems="center" justifyContent="space-between" padding="4px 4px" background="logic.emphasized">
				<FaAngleLeft onClick={event => { previousFormula(); event.stopPropagation(); }} visibility={inspectingIndex > 0 ? "visible" : "hidden"} />
				<Text padding="auto">{t("FormulaInspector.Title")}</Text>
				<FaAngleRight onClick={event => { nextFormula(); event.stopPropagation(); }} visibility={inspectingIndex < formulas.length - 1 ? "visible" : "hidden"} />
			</Flex>
			<VStack width="100%" padding="8px 8px">{
				inspectingIndex === -1 ? <Text>{t("FormulaInspector.PickFormula")}</Text> : (() => {
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
							<Text fontWeight="bold">{t("FormulaInspector.Formula")}</Text>
							<FormulaLatex formula={displayingFormula} />
						</HStack>
						<HStack width="100%">
							<Text fontWeight="bold">{t("FormulaInspector.Description")}</Text>
							<Text color="logic.fg">{displayingFormula.toDescription((key: string, content: {}) => t(key, content))}</Text>
						</HStack>
						<HStack width="100%" alignItems="center">
							<Text fontWeight="bold">{t("FormulaInspector.Code")}</Text>
							{copied ? <FaRegCircleCheck /> : <FaRegCopy onClick={event => { onCopyClick(); event.stopPropagation(); }} />}
							<Code variant="solid" size="md">{displayingFormula.toCode()}</Code>
						</HStack>
						<Box width="100%">
							<MarkdownWithLatex>{t(displayingFormula.getFormulaDescription())}</MarkdownWithLatex>
						</Box>
						<ListRoot width="100%" listStyle="inside">
							{subFormulas.map(formula => (
								<ListItem key={formula.toCode()} _marker={{ color: "inherit" }}>
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