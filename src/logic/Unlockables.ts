import { levelFromId } from "@/views/DataLoader";
import type { Level } from "./Level";

export interface PrerequisiteItem {
	isMet(): Boolean;
}
export interface UnlockableItem {
	getPrereqs(): PrereqInfo[];
}
export function isUnlocked(unlockableItem: UnlockableItem, upToLevel: Level | null = null) {
	if (unlockableItem === upToLevel) return false;
	return unlockableItem.getPrereqs().map(getPrereq).filter(item => item != undefined).every(item => item.isMet());
}
export interface PrereqInfo {
	type: string;
	chapterId: string | undefined;
	levelId: string | undefined;
}
export function getPrereq(info: PrereqInfo): PrerequisiteItem | undefined {
	if (info.type === "level" && info.chapterId !== undefined && info.levelId !== undefined) return levelFromId(info.chapterId, info.levelId);
	else return undefined;
}