import ConversationBox from "@/components/custom/ConversationBox";
import FormulaInspector from "@/components/custom/FormulaInspector";
import Inventory from "@/components/custom/Inventory";
import { LayoutStackLeft, LayoutStackMain, LayoutStackMiddle, LayoutStackRight } from "@/components/custom/Layout";
import LineInspector from "@/components/custom/LineInspector";
import ProofBoard from "@/components/custom/ProofBoard";
import { useUIStore } from "@/contexts/UIStore";
import type { LevelModule } from "@/logic/Level";
import type { WorldModule } from "@/logic/World";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function LevelProverPage() {
	const [loading, setLoading] = useState(false);
	const [levelModule, setLevelModule] = useState<LevelModule | null>(null);
	const { worldId, levelId } = useParams() as { worldId: string; levelId: string };
	const setWorldName: (worldName: string) => void = useUIStore(state => state.setWorldName);
	const setLevelName: (levelName: string) => void = useUIStore(state => state.setLevelName);
	const clearFormulas: () => void = useUIStore(state => state.clearFormulas);
	useEffect(() => {
		clearFormulas();
		setLoading(true);
		const load = async () => {
			try {
				const worldModule: WorldModule = await import(`../data/worlds/${worldId}/index.tsx`);
				const levelModule: LevelModule = await import(`../data/worlds/${worldId}/levels/${levelId}.mdx`);
				setLevelModule(levelModule);
				setWorldName("World: " + worldModule.meta.name);
				setLevelName("Level: " + levelModule.meta.name);
			} catch (error) {
				console.error(error);
			}
			setLoading(false);
		}
		load();
	}, []);
	if (loading) return null;
	else if (levelModule === null) return null;
	else return (
		<LayoutStackMain>
			<LayoutStackLeft>
				<ConversationBox>
					<levelModule.default />
				</ConversationBox>
			</LayoutStackLeft>
			<LayoutStackMiddle>
				<ProofBoard levelModule={levelModule} />
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