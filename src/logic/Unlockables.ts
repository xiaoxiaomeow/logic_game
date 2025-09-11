import { levelFromId } from "@/views/DataLoader";
import type { Level } from "./Level";

export interface UnlockTreeItem {
	isMet(): Boolean;
	isHardMet(): Boolean;
	getPrereqs(): Partial<PrereqInfo>[];
}
export function isUnlocked(unlockableItem: UnlockTreeItem, upToLevel: Level | null = null): boolean {
	if (unlockableItem === upToLevel) return false;
	return unlockableItem.getPrereqs().filter(info => !info.isHard).map(getPrereq).filter(item => item != undefined).every(item => item.isMet() && isUnlocked(item, upToLevel));
}
export function isHardUnlocked(unlockableItem: UnlockTreeItem, upToLevel: Level | null = null): boolean {
	if (unlockableItem === upToLevel) return false;
	return isUnlocked(unlockableItem, upToLevel) && unlockableItem.getPrereqs().filter(info => info.isHard).map(getPrereq).filter(item => item != undefined).every(item => item.isHardMet() && isHardUnlocked(item, upToLevel));
}
export interface PrereqInfo {
	type: string;
	chapterId: string;
	levelId: string;
	isHard: Boolean;
}
export function getPrereq(info: Partial<PrereqInfo>): UnlockTreeItem | undefined {
	if (info.type === "level" && info.chapterId !== undefined && info.levelId !== undefined) return levelFromId(info.chapterId, info.levelId);
	else {
		console.warn("The following info does not define a UnlockTreeItem:")
		console.warn(info)
		return undefined;
	}
}