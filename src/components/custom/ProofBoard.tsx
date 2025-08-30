import type { LevelModule } from "@/logic/Level";
import { Box, Button, Flex, HStack, IconButton, Input, InputGroup, ScrollArea, Table, Text, VStack } from "@chakra-ui/react";
import FormulaLatex from "./FormulaLatex";
import MarkdownWithLatex from "./MarkdownWithLatex";
import Proof, { FormulaLine, ProofLine, ProvedFormulaLine, type ExcecutionResult } from "@/logic/Proof";
import { useUIStore } from "@/contexts/UIStore";
import { useEffect, useRef } from "react";
import { FaChevronRight, FaRegTrashAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

export interface ProofBoardInput {
	levelModule: LevelModule
}

function ProofBoard(props: ProofBoardInput) {
	const levelModule: LevelModule = props.levelModule;
	const proof: Proof | null = useUIStore(state => state.proof);
	const setProof: (proof: Proof) => void = useUIStore(state => state.setProof);
	useEffect(() => {
		const proof: Proof = new Proof(levelModule.meta.logicSystem, levelModule.meta.axioms, levelModule.meta.target, null);
		setProof(proof);
	}, []);
	return (
		<Flex direction="column" width="100%" height="100%" justifyContent="space-between" padding="8px 0" gap="8px">
			<LevelInfo levelModule={levelModule}></LevelInfo>
			<ScrollArea.Root height="100%">
				<ScrollArea.Viewport height="100%">
					<ScrollArea.Content height="100%">
						<ProofEditor />
						{proof != null && proof.validate() ? <Box borderRadius="md" background="logic.author" width="100%" padding="8px">
							<Text>{t("ProofBoard.LevelFinished")}</Text>
						</Box> : null}
					</ScrollArea.Content>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar orientation="horizontal" />
				<ScrollArea.Scrollbar orientation="vertical" />
				<ScrollArea.Corner />
			</ScrollArea.Root>
			<CommandEditor />
		</Flex>
	);
}

function LevelInfo(props: ProofBoardInput) {
	const levelModule: LevelModule = props.levelModule;
	const t = useTranslation().t;
	return (
		<VStack width="100%" borderRadius="md" background="logic.subtle" padding="8px 8px">
			<HStack width="100%">
				<Text fontWeight="bold">{t("ProofBoard.Statement")}</Text>
				<MarkdownWithLatex>{levelModule.meta.statement}</MarkdownWithLatex>
			</HStack>
			<HStack width="100%">
				<Text fontWeight="bold">{t("ProofBoard.Language")}</Text>
				<Text>{t(levelModule.meta.logicSystem.name)}</Text>
			</HStack>
			<HStack width="100%">
				<Text fontWeight="bold">{t("ProofBoard.Axioms")}</Text>
				{levelModule.meta.axioms.map(axiom => (<Box key={axiom.toCode()}><FormulaLatex formula={axiom} /></Box>))}
			</HStack>
			<HStack width="100%">
				<Text fontWeight="bold">{t("ProofBoard.Target")}</Text>
				<FormulaLatex formula={levelModule.meta.target} />
			</HStack>
		</VStack>
	);
}

function ProofEditor() {
	const proof: Proof | null = useUIStore(state => state.proof);
	const lineIndex = useUIStore(state => state.lineIndex);
	const setLineIndex = useUIStore(state => state.setLineIndex);
	const t = useTranslation().t;
	useEffect(() => {
		setLineIndex(0);
	}, []);
	if (proof != null) return (
		<VStack padding="8px 8px" marginBottom="auto">
			<Table.Root variant="line" size="sm">
				<Table.ColumnGroup>
					<Table.Column htmlWidth="0%" />
					<Table.Column htmlWidth="0%" />
					<Table.Column htmlWidth="100%" />
					<Table.Column htmlWidth="0%" />
				</Table.ColumnGroup>
				<Table.Header></Table.Header>
				<Table.Body>
					{proof.lines.map((line: ProofLine, index: number) => (
						<Table.Row
							key={line.key()}
							borderBottom={index === proof.lines.length - 1 ? "2px double" : "1px solid"}
							borderTop={index === 0 ? "2px double" : ""}
							borderColor="logic.emphasized"
							onClick={event => { setLineIndex(index); event.stopPropagation(); }}
							backgroundColor={(() => {
								if (line instanceof FormulaLine && !(line instanceof ProvedFormulaLine)) return "{colors.yellow.50}";
								return "";
							})()}>
							<Table.Cell borderBottomWidth={0} padding="0">{lineIndex === index ? (<FaChevronRight color="#6b46c1" />) : null}</Table.Cell>
							<Table.Cell borderBottomWidth={0} padding="4px"><Text>{index}</Text></Table.Cell>
							<Table.Cell borderBottomWidth={0} padding="4px">{(() => {
								if (line instanceof ProvedFormulaLine) return (
									<Flex justifyContent="space-between">
										<FormulaLatex formula={line.formula}></FormulaLatex>
										<Text>{t(line.deductionMethod.getShortDescription())}</Text>
									</Flex>
								);
								else if (line instanceof FormulaLine) return (<HStack><Text color="logic.emphasized">{t("ProofEditor.NeedLeft")}</Text><FormulaLatex vague formula={line.formula} /><Text color="logic.emphasized">{t("ProofEditor.NeedRight")}</Text></HStack>);
								else return null;
							})()}</Table.Cell>
							<Table.Cell borderBottomWidth={0} padding="4px">{(() => {
								if (line instanceof ProvedFormulaLine) return (
									<IconButton size="2xs" variant="ghost" onClick={() => { }}>
										<FaRegTrashAlt />
									</IconButton>
								);
								else return null;
							})()}
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
		</VStack>
	);
	else return null;
}

function CommandEditor() {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const inputCommand: string = useUIStore(state => state.inputCommand);
	const setInputCommand: (command: string) => void = useUIStore(state => state.setInputCommand);
	const proof: Proof | null = useUIStore(state => state.proof);
	const setProof = useUIStore(state => state.setProof);
	const lineIndex = useUIStore(state => state.lineIndex);
	const setLineIndex = useUIStore(state => state.setLineIndex);
	const setErrorMessage = useUIStore(state => state.setErrorMessage);
	useEffect(() => { inputRef.current?.focus() }, [inputCommand]);
	const endElement = inputCommand ? (
		<IconButton size="2xs" variant="ghost" onClick={() => { setInputCommand(""); inputRef.current?.focus() }} me="-2" ><IoMdClose /></IconButton>
	) : undefined;
	const canExcecute: boolean = proof != null && lineIndex >= 0 && lineIndex < proof.lines.length && proof.lines[lineIndex] instanceof FormulaLine && !(proof.lines[lineIndex] instanceof ProvedFormulaLine);
	const excecuteCommand: () => void = () => {
		if (proof != null && canExcecute) {
			const result: ExcecutionResult = proof.excecute(inputCommand, lineIndex);
			if (result.success) {
				setErrorMessage("");
				setInputCommand("");
				if (result.newLineIndex != null) setLineIndex(result.newLineIndex);
				setProof(proof.copy());
			}
			else if (result.errorMessage != null) {
				setErrorMessage(result.errorMessage);
			}
			else {
				setErrorMessage("");
			}
		}
	};
	return (
		<HStack width="100%">
			<InputGroup endElement={endElement}>
				<Input size="sm" ref={inputRef} value={inputCommand} fontFamily="monospace" onChange={e => { setInputCommand(e.currentTarget.value); }} onKeyUp={event => {
					if (event.key === "Enter") excecuteCommand();
				}}>
				</Input>
			</InputGroup>
			<Button size="sm" disabled={!canExcecute} onClick={excecuteCommand}>Excecute</Button>
		</HStack>
	);
}

export default ProofBoard;