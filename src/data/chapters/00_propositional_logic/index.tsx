import type { LevelModule } from "@/logic/Level";

const levelModules: [string, LevelModule][] = Object.entries<LevelModule>(import.meta.glob('./levels/*.mdx', { eager: true }));
export const meta = {
	id: "00_propositional_logic",
	name: "Chapter.PropositionalLogic.Name",
	levels: levelModules.map(([_, module]) => module),
	position: { x: 0, y: 0 }
}
