import type { Level } from "@/logic/Level";
import { Box, Button, Flex, HStack, IconButton, Input, InputGroup, ScrollArea, Table, Text, VStack } from "@chakra-ui/react";
import FormulaLatex from "./FormulaLatex";
import MarkdownWithLatex from "./MarkdownWithLatex";
import Proof, { UnprovedFormulaLine, ProofLine, ProvedFormulaLine } from "@/logic/Proof";
import { useUIStore } from "@/contexts/UIStore";
import { useCallback, useEffect, useRef } from "react";
import { FaChevronRight, FaRegTrashAlt } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { getLevelState, setLevelState } from "@/logic/LevelState";
import { useNavigate } from "react-router-dom";
import type { ExcecutionResult } from "@/logic/ProofCommand";

export interface ProofBoardInput {
	level: Level
}

function ProofBoard(props: ProofBoardInput) {
	const level: Level = props.level;
	const key: string = level.chapter.meta.id + "/" + level.meta.id;
	const proof: Proof | null = useUIStore(state => state.proof);
	const setProof: (proof: Proof | null) => void = useUIStore(state => state.setProof);
	const navigate = useNavigate();
	useEffect(() => {
		const jsonString = localStorage.getItem(key);
		let json: { type: string }[] | null = null;
		if (jsonString != null) {
			json = JSON.parse(jsonString) as { type: string }[];
		}
		const proof: Proof = new Proof(level, level.meta.axioms, level.meta.target, null, json);
		setProof(proof);
	}, []);
	useEffect(() => {
		if (proof != null) {
			const jsonString = JSON.stringify(proof.toJsonArray());
			localStorage.setItem(key, jsonString);

			const oldState: string = getLevelState(level);
			const newState: string = proof.proofComplete() ? "complete" : (proof.lines.length > 1 ? "partial" : "empty");
			if (oldState === newState) return;
			if (oldState === "modified" && newState !== "complete") return;
			if (oldState === "complete") setLevelState(level, "modified");
			else setLevelState(level, newState);
		}
	}, [proof]);
	return (
		<Flex direction="column" width="100%" height="100%" justifyContent="space-between" padding="8px 0" gap="8px">
			<LevelInfo level={level}></LevelInfo>
			<ScrollArea.Root height="100%">
				<ScrollArea.Viewport height="100%">
					<ScrollArea.Content height="100%">
						<ProofEditor />
						{(() => {
							if (proof != null && proof.proofComplete()) {
								const currentIndex = level.chapter.levels.indexOf(level);
								return (
									<HStack borderRadius="md" background="logic.author" width="100%" padding="8px">
										<Text>{t("ProofBoard.LevelFinished")}</Text>
										{currentIndex < level.chapter.levels.length - 1 ? <Button size="sm" onClick={event => {
											const nextLevel = level.chapter.levels[currentIndex + 1];
											navigate("/level/" + nextLevel.chapter.meta.id + "/" + nextLevel.meta.id);
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
				<ScrollArea.Scrollbar orientation="vertical" />
			</ScrollArea.Root>
			<CommandEditor />
		</Flex>
	);
}

function LevelInfo(props: ProofBoardInput) {
	const level: Level = props.level;
	const t = useTranslation().t;
	return (
		<VStack width="100%" borderRadius="md" background="logic.subtle" padding="8px 8px">
			<HStack width="100%">
				<Text fontWeight="bold">{t("ProofBoard.Statement")}</Text>
				<MarkdownWithLatex>{level.meta.statement}</MarkdownWithLatex>
			</HStack>
			<HStack width="100%">
				<Text fontWeight="bold">{t("ProofBoard.Language")}</Text>
				<Text>{t(level.meta.logicSystem.name)}</Text>
			</HStack>
			{level.meta.axioms.length > 0 ? <HStack width="100%">
				<Text fontWeight="bold">{t("ProofBoard.Axioms")}</Text>
				{level.meta.axioms.map((axiom, index) => (<Box key={axiom.toCode()}><FormulaLatex formula={axiom} />{index != level.meta.axioms.length - 1 ? "," : ""}</Box>))}
			</HStack> : null}
			<HStack width="100%">
				<Text fontWeight="bold">{t("ProofBoard.Target")}</Text>
				<FormulaLatex formula={level.meta.target} />
			</HStack>
		</VStack>
	);
}

function ProofEditor() {
	const proof: Proof | null = useUIStore(state => state.proof);
	const setProof: (proof: Proof | null) => void = useUIStore(state => state.setProof);
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
							key={index + "/" + line.key()}
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
										<MarkdownWithLatex>{line.deductionMethod.getShortDescription((key: string, content: {}) => t(key, content), proof)}</MarkdownWithLatex>
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
									<IconButton size="2xs" variant="ghost" onClick={event => {
										const newIndex = proof.remove(index);
										setLineIndex(newIndex);
										setProof(proof.copy());
										event.stopPropagation();
									}}>
										<FaRegTrashAlt />
									</IconButton>
								);
								if (line instanceof UnprovedFormulaLine) return (
									<IconButton size="2xs" variant="ghost" disabled={proof.isFormulaRequired(line.formula, index)} onClick={event => {
										const newIndex = proof.remove(index);
										setLineIndex(newIndex);
										setProof(proof.copy());
										event.stopPropagation();
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
	const canExcecute: boolean = proof != null && lineIndex >= 0 && lineIndex < proof.lines.length;
	const excecute: () => void = () => {
		if (proof != null && canExcecute) {
			const result: Partial<ExcecutionResult> = proof.excecute(inputCommand, lineIndex);
			if (result.success) {
				setErrorMessage("");
				setInputCommand("");
				if (result.newLineIndex != null) setLineIndex(result.newLineIndex);
				setProof(proof.copy());
			}
			else if (result.errorMessage != null) {
				console.log(result.errorMessage);
				setErrorMessage(result.errorMessage);
			}
		}
	};
	return (
		<HStack width="100%">
			<InputGroup endElement={endElement}>
				<Input size="sm" ref={inputRef} value={inputCommand} fontFamily="monospace" onChange={e => { setInputCommand(e.currentTarget.value); }} onKeyUp={event => {
					if (event.key === "Enter") excecute();
				}}>
				</Input>
			</InputGroup>
			<Button size="sm" disabled={!canExcecute} onClick={excecute}>{t("ProofBoard.Excecute")}</Button>
		</HStack>
	);
}

export default ProofBoard;