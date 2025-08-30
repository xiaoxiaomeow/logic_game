import type { Formula } from '@/logic/LogicSystem';
import type Proof from '@/logic/Proof';
import { create, type StoreApi, type UseBoundStore } from 'zustand';

export interface UIStore {
	conversationProgress: number;
	increaseConversationProgress: () => void;
	setConversationProgress: (progress: number) => void;
	resetConversationProgress: () => void;
	chapterName: string;
	setChapterName: (chapterName: string) => void;
	levelName: string;
	setLevelName: (levelName: string) => void;
	formulas: Formula[];
	inspectingIndex: number;
	inspect: (formula: Formula) => void;
	previousFormula: () => void;
	nextFormula: () => void;
	clearFormulas: () => void;
	proof: Proof | null;
	setProof: (proof: Proof | null) => void;
	lineIndex: number;
	setLineIndex: (lineIndex: number) => void;
	inputCommand: string;
	setInputCommand: (command: string) => void;
	errorMessage: string;
	setErrorMessage: (errorMessage: string) => void;
}

export const useUIStore: UseBoundStore<StoreApi<UIStore>> = create<UIStore>(set => ({
	conversationProgress: 0,
	increaseConversationProgress: () => set(state => ({ conversationProgress: state.conversationProgress + 1 })),
	setConversationProgress: (progress: number) => set({ conversationProgress: progress }),
	resetConversationProgress: () => set({ conversationProgress: 0 }),
	chapterName: "",
	setChapterName: (chapterName: string) => set({ chapterName: chapterName }),
	levelName: "",
	setLevelName: (levelName: string) => set({ levelName: levelName }),
	formulas: [],
	inspectingIndex: -1,
	inspect: (formula: Formula) => set((state: UIStore) => {
		if (state.formulas.length === 0 || !state.formulas[state.formulas.length - 1].equals(formula)) {
			state.formulas = state.formulas.slice(0, state.inspectingIndex + 1);
			state.formulas.push(formula);
		}
		return { formulas: state.formulas, inspectingIndex: state.formulas.length - 1 };
	}),
	previousFormula: () => set((state: UIStore) => {
		if (state.inspectingIndex > 0) return { inspectingIndex: state.inspectingIndex - 1 };
		else return {};
	}),
	nextFormula: () => set((state: UIStore) => {
		if (state.inspectingIndex < state.formulas.length - 1) return { inspectingIndex: state.inspectingIndex + 1 };
		else return {};
	}),
	clearFormulas: () => set({ formulas: [], inspectingIndex: -1 }),
	proof: null,
	setProof: (proof: Proof | null) => set({ proof: proof }),
	lineIndex: -1,
	setLineIndex: (lineIndex: number) => set({ lineIndex: lineIndex }),
	inputCommand: "",
	setInputCommand: (command: string) => set({ inputCommand: command }),
	errorMessage: "",
	setErrorMessage: (errorMessage: string) => set({ errorMessage: errorMessage })
}));