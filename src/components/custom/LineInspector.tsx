import { useUIStore } from "@/contexts/UIStore";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import FormulaLatex from "./FormulaLatex";
import MarkdownWithLatex from "./MarkdownWithLatex";
import Proof, { UnprovedFormulaLine, ProvedFormulaLine, type ProofLine } from "@/logic/Proof";
import { useTranslation } from "react-i18next";

function LineInspector() {
	const proofs: Proof[] = useUIStore(state => state.proofs);
	const displayingIndex: number = useUIStore(state => state.displayingIndex);
	const proof: Proof | null = displayingIndex >= 0 ? proofs[displayingIndex] : null;
	const lineIndex: number = useUIStore(state => state.lineIndex);
	const proofLine: ProofLine | null = (proof != null && 0 <= lineIndex && lineIndex < proof.lines.length) ? proof.lines[lineIndex] : null;
	const t = useTranslation().t;
	return (
		<VStack width="100%" background="logic.subtle" gap="0">
			<Flex width="100%" justifyContent="center" padding="4px 4px" background="logic.emphasized">
				<Text>{t("LineInspector.Title")}</Text>
			</Flex>
			<VStack width="100%" padding="8px 8px">{
				proof === null || proofLine === null ? <Text>Click on a line in the proof to inspect it.</Text> : (() => {
					if (proofLine instanceof UnprovedFormulaLine) {
						return (<>
							<HStack width="100%">
								<Text fontWeight="bold">{t("LineInspector.LineNumber")}</Text>
								<Text>{lineIndex}</Text>
							</HStack>
							<HStack width="100%">
								<Text fontWeight="bold">{t("LineInspector.PendingFormula")}</Text>
								<FormulaLatex formula={proofLine.formula} />
							</HStack>
							<Box width="100%">
								<MarkdownWithLatex>{proofLine.getLineDescription((key: string, content: {}) => t(key, content), proof, lineIndex)}</MarkdownWithLatex>
							</Box>
						</>);
					}
					else if (proofLine instanceof ProvedFormulaLine) {
						return (<>
							<HStack width="100%">
								<Text fontWeight="bold">{t("LineInspector.LineNumber")}</Text>
								<Text>{lineIndex}</Text>
							</HStack>
							<HStack width="100%">
								<Text fontWeight="bold">{t("LineInspector.Formula")}</Text>
								<FormulaLatex formula={proofLine.formula} />
							</HStack>
							<Box width="100%">
								<MarkdownWithLatex>{proofLine.getLineDescription((key: string, content: {}) => t(key, content), proof, lineIndex)}</MarkdownWithLatex>
							</Box>
						</>);
					}
					else return null;
				})()
			}</VStack>
		</VStack>
	);
}

export default LineInspector;