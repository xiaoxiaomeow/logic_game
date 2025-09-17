import { useUIStore } from "@/contexts/UIStore";
import type { LogicAxiom } from "@/logic/LogicSystem";
import type Proof from "@/logic/Proof";
import getUnlockedProofMethods, { ProofMethod } from "@/logic/ProofMethod";
import { Button, Flex, Tabs, Text, VStack, Wrap } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import MarkdownWithLatex from "./MarkdownWithLatex";
import { SingleAxiom } from "@/logic/AxiomSchema";
import { isUnlocked } from "@/logic/Unlockables";

function Inventory() {
	const proofs: Proof[] = useUIStore(state => state.proofs);
	const displayingIndex: number = useUIStore(state => state.displayingIndex);
	const proof: Proof | null = displayingIndex >= 0 ? proofs[displayingIndex] : null;
	const level = useUIStore(state => state.level);
	const setInputCommand: (command: string) => void = useUIStore(state => state.setInputCommand);
	const t = useTranslation().t;
	const proofMethods: ProofMethod[] = getUnlockedProofMethods();
	const logicAxioms: LogicAxiom[] = proof != null ? proof.level.meta.logicSystem.getUnlockedLogicAxioms(level) : [];
	return (
		<VStack width="100%" background="logic.subtle" gap="0">
			<Flex width="100%" justifyContent="center" padding="4px 4px" background="logic.emphasized">
				<Text>{t("Inventory.Title")}</Text>
			</Flex>
			<VStack width="100%">
				<Tabs.Root width="100%" size="sm" defaultValue="axioms" deselectable={false}>
					<Tabs.List width="100%">
						{proof != null ? <Tabs.Trigger value="axioms">{t("Inventory.Axioms")}</Tabs.Trigger> : null}
						{proof != null && logicAxioms.length > 0 ? <Tabs.Trigger value="logicAxioms">{t("Inventory.LogicAxioms")}</Tabs.Trigger> : null}
						{proof != null && proofMethods.length > 0 ? <Tabs.Trigger value="proofMethods">{t("Inventory.ProofMethods")}</Tabs.Trigger> : null}
					</Tabs.List>
					{proof != null ? <Tabs.Content value="axioms" padding="8px 8px">
						<Wrap>
							{proof.axioms.map(axiom => (
								<Button key={axiom.name} size="sm" onClick={event => {
									if (axiom instanceof SingleAxiom) setInputCommand("axiom " + axiom.axiom.toCode());
									else if (axiom.codes.length > 0) setInputCommand("axiom $" + axiom.codes[0] + " ");
									event.stopPropagation();
								}}>
									<MarkdownWithLatex>{t(axiom.name)}</MarkdownWithLatex>
								</Button>
							))}
						</Wrap>
					</Tabs.Content> : null}
					{proof != null && logicAxioms.length > 0 ? <Tabs.Content value="logicAxioms" padding="8px 8px">
						<Wrap>
							{logicAxioms.map(logicAxiom => logicAxiom.axiom).map(axiom => (
								<Button key={axiom.name} size="sm" onClick={event => {
									if (axiom instanceof SingleAxiom) setInputCommand("axiom " + axiom.axiom.toCode());
									else if (axiom.codes.length > 0) setInputCommand("axiom $" + axiom.codes[0] + " ");
									event.stopPropagation();
								}}>
									<MarkdownWithLatex>{t(axiom.name)}</MarkdownWithLatex>
								</Button>
							))}
						</Wrap>
					</Tabs.Content> : null}
					{proof != null && proofMethods.length > 0 ? <Tabs.Content value="proofMethods" padding="8px 8px">
						<Wrap>
							{proofMethods.map(method => (
								<Button key={method.name} disabled={!isUnlocked(method, level)} size="sm" onClick={event => {
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