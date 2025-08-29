import { useUIStore } from "@/contexts/UIStore";
import type Proof from "@/logic/Proof";
import { Button, Flex, Tabs, Text, VStack } from "@chakra-ui/react";
import { InlineMath } from 'react-katex';

function Inventory() {
	const proof: Proof | null = useUIStore(state => state.proof);
	const setInputCommand: (command: string) => void = useUIStore(state => state.setInputCommand);
	return (
		<VStack width="100%" background="logic.subtle" gap="0">
			<Flex width="100%" justifyContent="center" padding="4px 4px" background="logic.emphasized">
				<Text>Inventory</Text>
			</Flex>
			<VStack width="100%">
				<Tabs.Root width="100%" size="sm" defaultValue="axioms" deselectable={false}>
					<Tabs.List width="100%">
						{proof != null ? <Tabs.Trigger value="axioms">Axioms</Tabs.Trigger> : null}
					</Tabs.List>
					{proof != null ? <Tabs.Content value="axioms" padding="8px 8px">
						{proof.axioms.map(axiom => (
							<Button key={axiom.toCode()} size="sm" onClick={event => { setInputCommand("axiom " + axiom.toCode()); event.stopPropagation(); }}>
								<InlineMath math={axiom.toLatex()}></InlineMath>
							</Button>
						))}
					</Tabs.Content> : null}
				</Tabs.Root>
			</VStack>
		</VStack>
	);
}

export default Inventory;