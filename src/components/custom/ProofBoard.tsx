import type { LevelModule } from "@/logic/Level";
import { Box, Button, Flex, HStack, IconButton, Input, InputGroup, ScrollArea, Table, Text, VStack } from "@chakra-ui/react";
import FormulaLatex from "./FormulaLatex";
import MarkdownWithLatex from "./MarkdownWithLatex";
import Proof, { UnprovedFormulaLine, ProofLine, ProvedFormulaLine, type ExcecutionResult } from "@/logic/Proof";
import { useUIStore } from "@/contexts/UIStore";
import { useCallback, useEffect, useRef } from "react";
import { FaChevronRight, FaRegTrashAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import type { ChapterModule } from "@/logic/Chapter";
import { setLevelState } from "@/logic/LevelState";
import { useNavigate } from "react-router-dom";

export interface ProofBoardInput {
	levelModule: LevelModule,
	chapterModule: ChapterModule
}

function ProofBoard(props: ProofBoardInput) {
	const levelModule: LevelModule = props.levelModule;
	const chapterModule: ChapterModule = props.chapterModule;
	const key: string = chapterModule.meta.id + "/" + levelModule.meta.id;
	const proof: Proof | null = useUIStore(state => state.proof);
	const setProof: (proof: Proof) => void = useUIStore(state => state.setProof);
	const navigate = useNavigate();
	useEffect(() => {
		const jsonString = localStorage.getItem(key);
		let json: { type: string }[] | null = null;
		if (jsonString != null) {
			json = JSON.parse(jsonString) as { type: string }[];
		}
		const proof: Proof = new Proof(levelModule.meta.logicSystem, levelModule.meta.axioms, levelModule.meta.target, null, json);
		setProof(proof);
	}, []);
	useEffect(() => {
		if (proof != null) {
			const jsonString = JSON.stringify(proof.toJsonArray());
			localStorage.setItem(key, jsonString);

			const newState: string = proof.proofComplete() ? "complete" : (proof.lines.length > 1 ? "partial" : "empty");
			setLevelState(chapterModule.meta.id, levelModule.meta.id, newState);
		}
	}, [proof]);
	return (
		<Flex direction="column" width="100%" height="100%" justifyContent="space-between" padding="8px 0" gap="8px">
			<LevelInfo levelModule={levelModule} chapterModule={chapterModule}></LevelInfo>
			<ScrollArea.Root height="100%">
				<ScrollArea.Viewport height="100%">
					<ScrollArea.Content height="100%">
						<ProofEditor />
						{(() => {
							if (proof != null && proof.proofComplete()) {
								const currentIndex = chapterModule.meta.levels.indexOf(levelModule);
								return (
									<HStack borderRadius="md" background="logic.author" width="100%" padding="8px">
										<Text>{t("ProofBoard.LevelFinished")}</Text>
										{currentIndex < chapterModule.meta.levels.length - 1 ? <Button size="sm" onClick={event => {
											const nextLevelModule = chapterModule.meta.levels[currentIndex + 1];
											navigate("/level/" + chapterModule.meta.id + "/" + nextLevelModule.meta.id);
											event.stopPropagation();
										}}>{t("ProofBoard.NextLevel")}</Button> : null}
										<Button size="sm" onClick={event => {
											navigate("/");
											event.stopPropagation();
										}}>{t("ProofBoard.LevelSelector")}</Button>
									</HStack>);
							}
							else return null;
						})()}
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
				{levelModule.meta.axioms.map((axiom, index) => (<Box key={axiom.toCode()}><FormulaLatex formula={axiom} />{index != levelModule.meta.axioms.length - 1 ? "," : ""}</Box>))}
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
	const setProof: (proof: Proof) => void = useUIStore(state => state.setProof);
	const lineIndex = useUIStore(state => state.lineIndex);
	const setLineIndex = useUIStore(state => state.setLineIndex);
	const t = useTranslation().t;
	const keydown: (event: KeyboardEvent) => void = useCallback(
		(event: KeyboardEvent) => {
			if (proof != null && event.key === "ArrowUp" && lineIndex > 0) {
				setLineIndex(lineIndex - 1);
				event.stopPropagation();
			}
			if (proof != null && event.key === "ArrowDown" && lineIndex < proof.lines.length - 1) {
				setLineIndex(lineIndex + 1);
				event.stopPropagation();
			}
		}, [proof, lineIndex]
	);
	useEffect(() => {
		setLineIndex(0);
	}, []);
	useEffect(() => {
		document.addEventListener("keydown", keydown);
		return () => {
			document.removeEventListener("keydown", keydown);
		}
	}, [proof, lineIndex]);
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
								if (line instanceof UnprovedFormulaLine && !(line instanceof ProvedFormulaLine)) return "{colors.yellow.50}";
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
								else if (line instanceof UnprovedFormulaLine) return (
									<HStack>
										<Text color="logic.emphasized">{t("ProofEditor.NeedLeft")}</Text>
										<FormulaLatex vague formula={line.formula} />
										<Text color="logic.emphasized">{t("ProofEditor.NeedRight")}</Text>
									</HStack>
								);
								else return null;
							})()}</Table.Cell>
							<Table.Cell borderBottomWidth={0} padding="4px">{(() => {
								if (line instanceof ProvedFormulaLine) return (
									<IconButton size="2xs" variant="ghost" onClick={() => {
										proof.remove(index);
										setProof(proof.copy());
									}}>
										<FaRegTrashAlt />
									</IconButton>
								);
								if (line instanceof UnprovedFormulaLine) return (
									<IconButton size="2xs" variant="ghost" disabled={proof.isFormulaRequired(line.formula, index)} onClick={() => {
										proof.remove(index);
										setProof(proof.copy());
									}}>
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
	const t = useTranslation().t;
	useEffect(() => { inputRef.current?.focus() }, [inputCommand]);
	const endElement = inputCommand ? (
		<IconButton size="2xs" variant="ghost" onClick={() => { setInputCommand(""); inputRef.current?.focus() }} marginEnd="-2" ><IoMdClose /></IconButton>
	) : undefined;
	const canExcecute: boolean = proof != null && lineIndex >= 0 && lineIndex < proof.lines.length && proof.lines[lineIndex] instanceof UnprovedFormulaLine && !(proof.lines[lineIndex] instanceof ProvedFormulaLine);
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
			<Button size="sm" disabled={!canExcecute} onClick={excecuteCommand}>{t("ProofBoard.Excecute")}</Button>
		</HStack>
	);
}

export default ProofBoard;