import ConversationBox from "@/components/custom/ConversationBox";
import FormulaInspector from "@/components/custom/FormulaInspector";
import Inventory from "@/components/custom/Inventory";
import { LayoutStackLeft, LayoutStackMain, LayoutStackMiddle, LayoutStackRight } from "@/components/custom/Layout";
import LineInspector from "@/components/custom/LineInspector";
import ProofBoard from "@/components/custom/ProofBoard";
import { useUIStore } from "@/contexts/UIStore";
import type { LevelModule } from "@/logic/Level";
import type { ChapterModule } from "@/logic/Chapter";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

function LevelProverPage() {
	const [loading, setLoading] = useState(false);
	const [chapterModule, setChapterModule] = useState<ChapterModule | null>(null);
	const [levelModule, setLevelModule] = useState<LevelModule | null>(null);
	const params = useParams();
	const { chapterId, levelId } = params as { chapterId: string; levelId: string };
	const setChapterName: (chapterName: string) => void = useUIStore(state => state.setChapterName);
	const setLevelName: (levelName: string) => void = useUIStore(state => state.setLevelName);
	const clearFormulas: () => void = useUIStore(state => state.clearFormulas);
	const t = useTranslation().t;
	useEffect(() => {
		clearFormulas();
		setLoading(true);
		const load = async () => {
			try {
				const chapterModule: ChapterModule = await import(`../data/chapters/${chapterId}/index.tsx`);
				const levelModule: LevelModule = await import(`../data/chapters/${chapterId}/levels/${levelId}.mdx`);
				setChapterModule(chapterModule);
				setLevelModule(levelModule);
				setChapterName(t("LevelSelector.Chapter") + t(chapterModule.meta.name));
				setLevelName(t("LevelSelector.Level") + t(levelModule.meta.name));
			} catch (error) {
				console.error(error);
			}
			setLoading(false);
		}
		load();
	}, [params]);
	if (loading) return null;
	else if (levelModule === null || chapterModule == null) return null;
	else return (
		<LayoutStackMain>
			<LayoutStackLeft>
				<ConversationBox>
					<levelModule.default />
				</ConversationBox>
			</LayoutStackLeft>
			<LayoutStackMiddle>
				<ProofBoard levelModule={levelModule} chapterModule={chapterModule} />
			</LayoutStackMiddle>
			<LayoutStackRight>
				<LineInspector></LineInspector>
				<FormulaInspector></FormulaInspector>
				<Inventory></Inventory>
			</LayoutStackRight>
		</LayoutStackMain>
	);
}

export default LevelProverPage;