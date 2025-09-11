import { useUIStore } from "@/contexts/UIStore";
import type { LogicAxiom } from "@/logic/LogicSystem";
import type Proof from "@/logic/Proof";
import getUnlockedProofMethods, { ProofMethod } from "@/logic/ProofMethod";
import { isHardUnlocked } from "@/logic/Unlockables";
import { Button, Flex, Tabs, Text, VStack, Wrap } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { InlineMath } from 'react-katex';

function Inventory() {
	const proof: Proof | null = useUIStore(state => state.proof);
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
								<Button key={axiom.toCode()} size="sm" onClick={event => {
									setInputCommand("axiom " + axiom.toCode());
									event.stopPropagation();
								}}>
									<InlineMath math={axiom.toLatex()}></InlineMath>
								</Button>
							))}
						</Wrap>
					</Tabs.Content> : null}
					{proof != null && logicAxioms.length > 0 ? <Tabs.Content value="logicAxioms" padding="8px 8px">
						<Wrap>
							{logicAxioms.map(logicAxiom => (
								<Button key={logicAxiom.formula.toCode()} size="sm" onClick={event => {
									setInputCommand("axiom " + logicAxiom.formula.toCode());
									event.stopPropagation();
								}}>
									<InlineMath math={logicAxiom.formula.toLatex()}></InlineMath>
								</Button>
							))}
						</Wrap>
					</Tabs.Content> : null}
					{proof != null && proofMethods.length > 0 ? <Tabs.Content value="proofMethods" padding="8px 8px">
						<Wrap>
							{proofMethods.map(method => (
								<Button key={method.name} disabled={!isHardUnlocked(method, level)} size="sm" onClick={event => {
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