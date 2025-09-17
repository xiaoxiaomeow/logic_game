import { Formula } from '@/logic/Formula';
import type { Level } from '@/logic/Level';
import Proof from '@/logic/Proof';
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
	level: Level | null;
	setLevel: (level: Level | null) => void;
	formulas: Formula[];
	inspectingIndex: number;
	inspect: (formula: Formula) => void;
	previousFormula: () => void;
	nextFormula: () => void;
	clearFormulas: () => void;
	proofs: Proof[];
	displayingIndex: number;
	setProof: (proof: Proof) => void;
	undo: () => void;
	redo: () => void;
	clearProofs: () => void;
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
	level: null,
	setLevel: (level: Level | null) => set({ level: level }),
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
	proofs: [],
	displayingIndex: -1,
	setProof: (proof: Proof) => set((state: UIStore) => {
		console.log(state.displayingIndex);
		console.log(state.proofs);
		console.log(proof);
		const proofs: Proof[] = state.proofs.slice(0, state.displayingIndex + 1);
		proofs.push(proof);
		return { proofs: proofs, displayingIndex: proofs.length - 1 };
	}),
	undo: () => set((state: UIStore) => {
		console.log(state.displayingIndex);
		console.log(state.proofs);
		if (state.displayingIndex > 0) return {
			displayingIndex: state.displayingIndex - 1,
			lineIndex: Math.min(state.lineIndex, state.proofs[state.displayingIndex - 1].lines.length - 1)
		};
		else return {};
	}),
	redo: () => set((state: UIStore) => {
		if (state.displayingIndex < state.proofs.length - 1) return {
			displayingIndex: state.displayingIndex + 1,
			lineIndex: Math.min(state.lineIndex, state.proofs[state.displayingIndex + 1].lines.length - 1)
		};
		else return {};
	}),
	clearProofs: () => set((state: UIStore) => {
		state.proofs = state.proofs.slice(0, state.displayingIndex + 1);
		return { proofs: [], displayingIndex: -1 };
	}),
	lineIndex: -1,
	setLineIndex: (lineIndex: number) => set({ lineIndex: lineIndex }),
	inputCommand: "",
	setInputCommand: (command: string) => set({ inputCommand: command }),
	errorMessage: "",
	setErrorMessage: (errorMessage: string) => set({ errorMessage: errorMessage })
}));