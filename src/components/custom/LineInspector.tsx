import { useUIStore } from "@/contexts/UIStore";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import FormulaLatex from "./FormulaLatex";
import MarkdownWithLatex from "./MarkdownWithLatex";
import Proof, { FormulaLine, ProvedFormulaLine, type ProofLine } from "@/logic/Proof";

function LineInspector() {
	const proof: Proof | null = useUIStore(state => state.proof);
	const lineIndex: number = useUIStore(state => state.lineIndex);
	const proofLine: ProofLine | null = (proof != null && 0 <= lineIndex && lineIndex < proof.lines.length) ? proof.lines[lineIndex] : null;
	return (
		<VStack width="100%" background="logic.subtle" gap="0">
			<Flex width="100%" justifyContent="center" padding="4px 4px" background="logic.emphasized">
				<Text>Line Inspector</Text>
			</Flex>
			<VStack width="100%" padding="8px 8px">{
				proof === null || proofLine === null ? <Text>Click on a line in the proof to inspect it.</Text> : (() => {
					if (proofLine instanceof FormulaLine) {
						const provedFormulaLine: ProvedFormulaLine = proofLine as ProvedFormulaLine;
						return (<>
							<HStack width="100%">
								<Text fontWeight="bold">Line Number</Text>
								<Text>{lineIndex}</Text>
							</HStack>
							<HStack width="100%">
								<Text fontWeight="bold">Formula</Text>
								<FormulaLatex formula={provedFormulaLine.formula} />
							</HStack>
							<Box width="100%">
								<MarkdownWithLatex>{proofLine.getLineDescription()}</MarkdownWithLatex>
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