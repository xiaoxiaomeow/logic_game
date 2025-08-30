import ConversationBox from "@/components/custom/ConversationBox";
import { LayoutStackLeft, LayoutStackMain, LayoutStackMiddle, LayoutStackRight } from "@/components/custom/Layout";
import { useUIStore } from "@/contexts/UIStore";
import { Button, Collapsible, Heading, HStack, ScrollArea, VStack } from "@chakra-ui/react";
import { useEffect, type MouseEventHandler } from "react";
import type { ChapterModule } from "@/logic/Chapter";
import type { LevelModule } from "@/logic/Level";
import Welcome from "@/data/Welcome.mdx";
import { useNavigate } from "react-router-dom";
import Inventory from "@/components/custom/Inventory";
import type Proof from "@/logic/Proof";
import { useTranslation } from "react-i18next";

function LevelSelectorPage() {
	const setChapterName: (chapterName: string) => void = useUIStore(state => state.setChapterName);
	const setLevelName: (levelName: string) => void = useUIStore(state => state.setLevelName);
	const clearFormulas: () => void = useUIStore(state => state.clearFormulas);
	const setProof: (proof: Proof | null) => void = useUIStore(state => state.setProof);
	const t = useTranslation().t;
	useEffect(() => {
		setChapterName(t("LevelSelector.ChapterName"));
		setLevelName(t("LevelSelector.LevelName"));
		clearFormulas();
		setProof(null);
	}, []);
	return (
		<LayoutStackMain>
			<LayoutStackLeft>
				<ConversationBox>
					<Welcome />
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

const chapterModules: [string, ChapterModule][] = Object.entries<ChapterModule>(import.meta.glob('/src/data/chapters/*/index.tsx', { eager: true }));
function LevelSelector() {
	return (
		<VStack width="100%" height="100%" padding="8px 0px">
			<ScrollArea.Root height="100%">
				<ScrollArea.Viewport height="100%">
					<ScrollArea.Content height="100%">
						{
							chapterModules.map(([_, module]) => (<Chapter chapterModule={module} key={module.meta.id}></Chapter>))
						}
					</ScrollArea.Content>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar />
			</ScrollArea.Root>
		</VStack>
	);
}

function Chapter(props: { chapterModule: ChapterModule }) {
	const t = useTranslation().t;
	return (
		<Collapsible.Root defaultOpen={true}>
			<Collapsible.Trigger width="100%">
				<Heading as="h1">{t("LevelSelector.Chapter") + t(props.chapterModule.meta.name)}</Heading>
			</Collapsible.Trigger>
			<Collapsible.Content>
				<HStack width="100%">
					{props.chapterModule.meta.levels.map(module => (<Level chapterModule={props.chapterModule} levelModule={module} key={module.meta.id}></Level>))}
				</HStack>
			</Collapsible.Content>
		</Collapsible.Root>
	);
}

function Level(props: { chapterModule: ChapterModule, levelModule: LevelModule }) {
	const navigate = useNavigate();
	const t = useTranslation().t;
	const onClick: MouseEventHandler = _ => {
		navigate("/level/" + props.chapterModule.meta.id + "/" + props.levelModule.meta.id);
	};
	return (
		<Button onClick={onClick}>{t(props.levelModule.meta.name)}</Button>
	);
}
export default LevelSelectorPage;