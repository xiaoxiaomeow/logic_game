import type { Level } from "./Level";

export function getLevelStateUsingKey(key: string): string {
	const levelStateString = localStorage.getItem("levels");
	let states: any;
	if (levelStateString != null) {
		states = JSON.parse(levelStateString) as any;
	} else states = {};
	const state = states[key];
	if (typeof (state) === "string") return state;
	else return "empty";
}
export function getLevelState(level: Level): string {
	return getLevelStateUsingKey(level.chapter.meta.id + "/" + level.meta.id);
}
export function setLevelStateUsingKey(key: string, state: string) {
	const levelStateString = localStorage.getItem("levels");
	let states: any;
	if (levelStateString != null) {
		states = JSON.parse(levelStateString) as any;
	} else states = {};
	states[key] = state;
	localStorage.setItem("levels", JSON.stringify(states));
}
export function setLevelState(level: Level, state: string) {
	setLevelStateUsingKey(level.chapter.meta.id + "/" + level.meta.id, state);
}