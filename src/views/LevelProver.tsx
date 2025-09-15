import ConversationBox from "@/components/custom/ConversationBox";
import FormulaInspector from "@/components/custom/FormulaInspector";
import Inventory from "@/components/custom/Inventory";
import { LayoutStackLeft, LayoutStackMain, LayoutStackMiddle, LayoutStackRight } from "@/components/custom/Layout";
import LineInspector from "@/components/custom/LineInspector";
import ProofBoard from "@/components/custom/ProofBoard";
import { useUIStore } from "@/contexts/UIStore";
import type { Level, LevelModule } from "@/logic/Level";
import type { ChapterModule } from "@/logic/Chapter";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type Proof from "@/logic/Proof";
import { MDXComponents } from "@/components/ui/provider";
import { levelFromId } from "./DataLoader";
import ErrorMessage from "@/components/custom/ErrorMessage";

function LevelProverPage() {
	const [loading, setLoading] = useState(false);
	const [levelModule, setLevelModule] = useState<LevelModule | null>(null);
	const params = useParams();
	const { chapterId, levelId } = params as { chapterId: string; levelId: string };
	const level = useUIStore(state => state.level);
	const setLevel = useUIStore(state => state.setLevel);
	const setProof: (proof: Proof | null) => void = useUIStore(state => state.setProof);
	const setErrorMessage: (message: string) => void = useUIStore(state => state.setErrorMessage);
	const setChapterName: (chapterName: string) => void = useUIStore(state => state.setChapterName);
	const setLevelName: (levelName: string) => void = useUIStore(state => state.setLevelName);
	const clearFormulas: () => void = useUIStore(state => state.clearFormulas);
	const resetConversationProgress: () => void = useUIStore(state => state.resetConversationProgress);
	const t = useTranslation().t;
	useEffect(() => {
		clearFormulas();
		resetConversationProgress();
		setProof(null);
		setLevel(null);
		setErrorMessage("");
		setLoading(true);
		const load = async () => {
			try {
				const chapterModule: ChapterModule = await import(`../data/chapters/${chapterId}/index.tsx`);
				const levelModule: LevelModule = await import(`../data/chapters/${chapterId}/levels/${levelId}.mdx`);
				const level: Level | undefined = levelFromId(chapterModule.meta.id, levelModule.meta.id);
				if (level != undefined) {
					setLevelModule(levelModule);
					setLevel(level);
				}
			} catch (error) {
				console.error(error);
			}
			setLoading(false);
		}
		load();
	}, [params]);
	useEffect(() => {
		if (level != undefined) {
			setChapterName(t("LevelSelector.Chapter") + t(level.chapter.meta.name));
			setLevelName(t("LevelSelector.Level") + t(level.meta.name));
		}
	}, [level, t]);
	if (loading) return null;
	else if (levelModule === null || level == null) return null;
	else return (
		<LayoutStackMain>
			<LayoutStackLeft>
				<ConversationBox>
					<levelModule.default components={MDXComponents} />
				</ConversationBox>
			</LayoutStackLeft>
			<LayoutStackMiddle>
				<ProofBoard level={level} />
			</LayoutStackMiddle>
			<LayoutStackRight>
				<ErrorMessage></ErrorMessage>
				<LineInspector></LineInspector>
				<FormulaInspector></FormulaInspector>
				<Inventory></Inventory>
			</LayoutStackRight>
		</LayoutStackMain>
	);
}

export default LevelProverPage;