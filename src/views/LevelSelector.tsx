import ConversationBox from "@/components/custom/ConversationBox";
import { LayoutStackLeft, LayoutStackMain, LayoutStackMiddle, LayoutStackRight } from "@/components/custom/Layout";
import { useUIStore } from "@/contexts/UIStore";
import { Button, Collapsible, Heading, HStack, ScrollArea, VStack } from "@chakra-ui/react";
import { useEffect, type MouseEventHandler } from "react";
import type { Chapter } from "@/logic/Chapter";
import type { Level } from "@/logic/Level";
import Welcome from "@/data/Welcome.mdx";
import { useNavigate } from "react-router-dom";
import Inventory from "@/components/custom/Inventory";
import type Proof from "@/logic/Proof";
import { useTranslation } from "react-i18next";
import { getLevelState } from "@/logic/LevelState";
import { MDXComponents } from "@/components/ui/provider";
import { chapters } from "./DataLoader";
import { isUnlocked } from "@/logic/Unlockables";

function LevelSelectorPage() {
	const setChapterName: (chapterName: string) => void = useUIStore(state => state.setChapterName);
	const setLevelName: (levelName: string) => void = useUIStore(state => state.setLevelName);
	const clearFormulas: () => void = useUIStore(state => state.clearFormulas);
	const setProof: (proof: Proof | null) => void = useUIStore(state => state.setProof);
	const setLevel = useUIStore(state => state.setLevel);
	const t = useTranslation().t;
	useEffect(() => {
		clearFormulas();
		setProof(null);
		setLevel(null);
	}, []);
	useEffect(() => {
		setChapterName(t("LevelSelector.ChapterName"));
		setLevelName(t("LevelSelector.LevelName"));
	}, [t]);
	return (
		<LayoutStackMain>
			<LayoutStackLeft>
				<ConversationBox>
					<Welcome components={MDXComponents} />
				</ConversationBox>
			</LayoutStackLeft>
			<LayoutStackMiddle>
				<LevelSelector />
			</LayoutStackMiddle>
			<LayoutStackRight>
				<Inventory></Inventory>
			</LayoutStackRight>
		</LayoutStackMain>
	);
}

function LevelSelector() {
	return (
		<VStack width="100%" height="100%" padding="8px 0px">
			<ScrollArea.Root height="100%">
				<ScrollArea.Viewport height="100%">
					<ScrollArea.Content height="100%">
						{chapters.map(chapter => (<ChapterNode chapter={chapter} key={chapter.meta.id}></ChapterNode>))}
					</ScrollArea.Content>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar />
			</ScrollArea.Root>
		</VStack>
	);
}

function ChapterNode(props: { chapter: Chapter }) {
	const t = useTranslation().t;
	return (
		<Collapsible.Root defaultOpen={true}>
			<Collapsible.Trigger width="100%">
				<Heading as="h1">{t("LevelSelector.Chapter") + t(props.chapter.meta.name)}</Heading>
			</Collapsible.Trigger>
			<Collapsible.Content>
				<HStack width="100%">
					{props.chapter.levels.map(level => (<LevelNode level={level} key={level.meta.id}></LevelNode>))}
				</HStack>
			</Collapsible.Content>
		</Collapsible.Root>
	);
}

function LevelNode(props: { level: Level }) {
	const navigate = useNavigate();
	const t = useTranslation().t;
	const chapterId: string = props.level.chapter.meta.id;
	const levelId: string = props.level.meta.id;
	const onClick: MouseEventHandler = _ => {
		navigate("/level/" + chapterId + "/" + levelId);
	};
	const state = getLevelState(props.level);
	const unlocked = isUnlocked(props.level);
	return (
		<Button onClick={onClick} size="sm" disabled={!unlocked}
			colorPalette={unlocked ? { "empty": "yellow", "partial": "orange", "modified": "blue", "complete": "green" }[state] : "gray"}
		>{t(props.level.meta.name)}</Button>
	);
}
export default LevelSelectorPage;