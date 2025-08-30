export function getLevelState(chapterId: string, levelId: string): string {
	const levelStateString = localStorage.getItem("levels");
	let states: any;
	if (levelStateString != null) {
		states = JSON.parse(levelStateString) as any;
	} else states = {};
	const key = chapterId + "/" + levelId;
	const state = states[key];
	if (typeof (state) === "string") return state;
	else return "empty";
}
export function setLevelState(chapterId: string, levelId: string, state: string) {
	const levelStateString = localStorage.getItem("levels");
	let states: any;
	if (levelStateString != null) {
		states = JSON.parse(levelStateString) as any;
	} else states = {};
	const key = chapterId + "/" + levelId;
	states[key] = state;
	localStorage.setItem("levels", JSON.stringify(states));
}