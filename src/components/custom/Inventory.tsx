import { useUIStore } from "@/contexts/UIStore";
import type Proof from "@/logic/Proof";
import getUnlockedProofMethods from "@/logic/ProofMethod";
import { Button, Flex, Tabs, Text, VStack, Wrap } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { InlineMath } from 'react-katex';

function Inventory() {
	const proof: Proof | null = useUIStore(state => state.proof);
	const setInputCommand: (command: string) => void = useUIStore(state => state.setInputCommand);
	const t = useTranslation().t;
	return (
		<VStack width="100%" background="logic.subtle" gap="0">
			<Flex width="100%" justifyContent="center" padding="4px 4px" background="logic.emphasized">
				<Text>{t("Inventory.Title")}</Text>
			</Flex>
			<VStack width="100%">
				<Tabs.Root width="100%" size="sm" defaultValue="axioms" deselectable={false}>
					<Tabs.List width="100%">
						{proof != null ? <Tabs.Trigger value="axioms">{t("Inventory.Axioms")}</Tabs.Trigger> : null}
						{proof != null && getUnlockedProofMethods().length > 0 ? <Tabs.Trigger value="proofs">{t("Inventory.Proofs")}</Tabs.Trigger> : null}
					</Tabs.List>
					{proof != null ? <Tabs.Content value="axioms" padding="8px 8px">
						<Wrap>
							{proof.axioms.map(axiom => (
								<Button key={axiom.toCode()} size="sm" onClick={event => {
									setInputCommand("axiom " + axiom.toCode());
									event.stopPropagation();
								}}>
									<InlineMath math={axiom.toLatex()}></InlineMath>
								</Button>
							))}
						</Wrap>
					</Tabs.Content> : null}
					{proof != null && getUnlockedProofMethods().length > 0 ? <Tabs.Content value="proofs" padding="8px 8px">
						<Wrap>
							{getUnlockedProofMethods().map(method => (
								<Button key={method.name} size="sm" onClick={event => {
									setInputCommand(method.getCommand(proof));
									event.stopPropagation();
								}}>
									{t(method.name)}
								</Button>
							))}
						</Wrap>
					</Tabs.Content> : null}
				</Tabs.Root>
			</VStack>
		</VStack>
	);
}

export default Inventory;