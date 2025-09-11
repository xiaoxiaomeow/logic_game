import { Chapter, type ChapterModule } from "@/logic/Chapter";
import type { Level } from "@/logic/Level";

export const chapters: Chapter[] = Object.entries<ChapterModule>(import.meta.glob('/src/data/chapters/*/index.tsx', { eager: true })).map(([_, module]) => new Chapter(module.meta));

export function levelFromId(chapterId: string, levelId: string): Level | undefined {
	return chapters.find(chapter => chapter.meta.id === chapterId)?.levels?.find(level => level.meta.id === levelId);
}