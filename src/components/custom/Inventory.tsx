import { useUIStore } from "@/contexts/UIStore";
import type Proof from "@/logic/Proof";
import getUnlockedProofMethods, { ProofMethod } from "@/logic/ProofMethod";
import { Button, Flex, Tabs, Text, VStack, Wrap } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import MarkdownWithLatex from "./MarkdownWithLatex";
import { UnlockableAxiom } from "@/logic/Axiom";
import { isUnlocked } from "@/logic/Unlockables";
import type { UnlockableTheorem } from "@/logic/Theorem";

function Inventory() {
	const proofs: Proof[] = useUIStore(state => state.proofs);
	const displayingIndex: number = useUIStore(state => state.displayingIndex);
	const proof: Proof | null = displayingIndex >= 0 ? proofs[displayingIndex] : null;
	const level = useUIStore(state => state.level);
	const setInputCommand: (command: string) => void = useUIStore(state => state.setInputCommand);
	const t = useTranslation().t;
	const proofMethods: ProofMethod[] = getUnlockedProofMethods();
	const logicAxioms: UnlockableAxiom[] = proof != null ? proof.level.meta.logicSystem.getUnlockedLogicAxioms(level) : [];
	const logicTheorems: UnlockableTheorem[] = proof != null ? proof.level.meta.logicSystem.getUnlockedLogicTheorems(level) : [];
	return (
		<VStack width="100%" background="logic.subtle" gap="0">
			<Flex width="100%" justifyContent="center" padding="4px 4px" background="logic.emphasized">
				<Text>{t("Inventory.Title")}</Text>
			</Flex>
			<VStack width="100%">
				<Tabs.Root width="100%" size="sm" defaultValue="axioms" deselectable={false}>
					<Tabs.List width="100%">
						{proof != null && proofMethods.length > 0 ? <Tabs.Trigger value="proofMethods">{t("Inventory.ProofMethods")}</Tabs.Trigger> : null}
						{proof != null && proof.axioms.length > 0 ? <Tabs.Trigger value="axioms">{t("Inventory.Axioms")}</Tabs.Trigger> : null}
						{proof != null && logicAxioms.length > 0 ? <Tabs.Trigger value="logicAxioms">{t("Inventory.LogicAxioms")}</Tabs.Trigger> : null}
						{proof != null && logicTheorems.length > 0 ? <Tabs.Trigger value="logicTheorems">{t("Inventory.LogicTheorems")}</Tabs.Trigger> : null}
					</Tabs.List>
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
					{proof != null && proof.axioms.length > 0 ? <Tabs.Content value="axioms" padding="8px 8px">
						<Wrap>
							{proof.axioms.map(axiom => (
								<Button key={axiom.getName()} size="sm" onClick={event => {
									if (axiom.codes.length > 0) setInputCommand("axiom $" + axiom.codes[0]);
									else setInputCommand("axiom " + axiom.axiom.toCode());
									event.stopPropagation();
								}}>
									<MarkdownWithLatex>{t(axiom.getName())}</MarkdownWithLatex>
								</Button>
							))}
						</Wrap>
					</Tabs.Content> : null}
					{proof != null && logicAxioms.length > 0 ? <Tabs.Content value="logicAxioms" padding="8px 8px">
						<Wrap>
							{logicAxioms.map(logicAxiom => logicAxiom.axiom).map(axiom => (
								<Button key={axiom.getName()} size="sm" onClick={event => {
									if (axiom.codes.length > 0) setInputCommand("axiom $" + axiom.codes[0]);
									else setInputCommand("axiom " + axiom.axiom.toCode());
									event.stopPropagation();
								}}>
									<MarkdownWithLatex>{t(axiom.getName())}</MarkdownWithLatex>
								</Button>
							))}
						</Wrap>
					</Tabs.Content> : null}
					{proof != null && logicTheorems.length > 0 ? <Tabs.Content value="logicTheorems" padding="8px 8px">
						<Wrap>
							{logicTheorems.map(logicTheorem => logicTheorem.theorem).map(theorem => (
								<Button key={theorem.getName()} size="sm" onClick={event => {
									if (theorem.freeFormulaVariables.length === 0) setInputCommand("theorem " + theorem.axiom.toCode());
									else if (theorem.codes.length > 0) setInputCommand("theorem $" + theorem.codes[0] + " ");
									event.stopPropagation();
								}}>
									<MarkdownWithLatex>{t(theorem.getName())}</MarkdownWithLatex>
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