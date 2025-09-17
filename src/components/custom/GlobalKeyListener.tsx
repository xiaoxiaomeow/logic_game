import { useUIStore } from "@/contexts/UIStore";

export const GlobalKeyListener = (event: KeyboardEvent) => {
	const state = useUIStore.getState();
	if (event.key === "ArrowLeft") {
		state.previousFormula();
	} else if (event.key === "ArrowRight") {
		state.nextFormula();
	} else if (event.key === "ArrowUp") {
		const newIndex = Math.max(0, state.lineIndex - 1);
		state.setLineIndex(newIndex);
	} else if (event.key === "ArrowDown") {
		const proof = state.proofs[state.displayingIndex];
		if (proof != null) {
			const newIndex = Math.min(proof.lines.length - 1, state.lineIndex + 1);
			state.setLineIndex(newIndex);
		}
	} else if (event.key === "z" && event.ctrlKey) {
		state.undo();
	} else if (event.key === "y" && event.ctrlKey) {
		state.redo();
	}
}