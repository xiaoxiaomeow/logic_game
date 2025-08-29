import ConversationBox from "@/components/custom/ConversationBox";
import { LayoutStackLeft, LayoutStackMain, LayoutStackMiddle, LayoutStackRight } from "@/components/custom/Layout";
import { useUIStore } from "@/contexts/UIStore";
import { Button, Collapsible, Heading, HStack, ScrollArea, VStack } from "@chakra-ui/react";
import { useEffect, type MouseEventHandler } from "react";
import type { WorldModule } from "@/logic/World";
import type { LevelModule } from "@/logic/Level";
import Welcome from "@/data/Welcome.mdx";
import { useNavigate } from "react-router-dom";
import Inventory from "@/components/custom/Inventory";
import type Proof from "@/logic/Proof";

function LevelSelectorPage() {
	const setWorldName: (worldName: string) => void = useUIStore(state => state.setWorldName);
	const setLevelName: (levelName: string) => void = useUIStore(state => state.setLevelName);
	const clearFormulas: () => void = useUIStore(state => state.clearFormulas);
	const setProof: (proof: Proof | null) => void = useUIStore(state => state.setProof);
	useEffect(() => {
		setWorldName("Mathematical Logic Game");
		setLevelName("Level Selection");
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

const worldModules: [string, WorldModule][] = Object.entries<WorldModule>(import.meta.glob('/src/data/worlds/*/index.tsx', { eager: true }));
function LevelSelector() {
	return (
		<VStack width="100%" height="100%" padding="8px 0px">
			<ScrollArea.Root height="100%">
				<ScrollArea.Viewport height="100%">
					<ScrollArea.Content height="100%">
						{
							worldModules.map(([_, module]) => (<World worldModule={module} key={module.meta.id}></World>))
						}
					</ScrollArea.Content>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar />
			</ScrollArea.Root>
		</VStack>
	);
}

function World(props: { worldModule: WorldModule }) {
	return (
		<Collapsible.Root defaultOpen={true}>
			<Collapsible.Trigger width="100%">
				<Heading as="h1">World: {props.worldModule.meta.name}</Heading>
			</Collapsible.Trigger>
			<Collapsible.Content>
				<HStack width="100%">
					{props.worldModule.meta.levels.map(module => (<Level worldModule={props.worldModule} levelModule={module} key={module.meta.id}></Level>))}
				</HStack>
			</Collapsible.Content>
		</Collapsible.Root>
	);
}

function Level(props: { worldModule: WorldModule, levelModule: LevelModule }) {
	const navigate = useNavigate();
	const onClick: MouseEventHandler = _ => {
		navigate("/level/" + props.worldModule.meta.id + "/" + props.levelModule.meta.id);
	};
	return (
		<Button onClick={onClick}>{props.levelModule.meta.name}</Button>
	);
}
export default LevelSelectorPage;