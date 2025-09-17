import type { Level } from "./Level";
import type Proof from "./Proof";
import { isUnlocked, type PrereqInfo, type UnlockTreeItem } from "./Unlockables";

export class ProofMethod implements UnlockTreeItem {
	name: string;
	getCommand: (proof: Proof) => string;
	prereq: Partial<PrereqInfo>[];
	constructor(name: string, getCommand: (proof: Proof) => string, prereq: Partial<PrereqInfo>[]) {
		this.name = name;
		this.getCommand = getCommand;
		this.prereq = prereq;
	}
	isMet(): Boolean {
		return true;
	}
	getPrereqs(): Partial<PrereqInfo>[] {
		return this.prereq;
	}
}

const proofMethods = [
	new ProofMethod("ProofMethod.Axiom.Name", _ => "axiom ", []),
	new ProofMethod("ProofMethod.Deduction.Name", _ => "deduction ", [{ type: "level", chapterId: "00_propositional_logic", levelId: "00_axiom" }]),
	new ProofMethod("ProofMethod.Substitution.Name", _ => "substitution ", [{ type: "level", chapterId: "00_propositional_logic", levelId: "02_association" }]),
];

function getUnlockedProofMethods(upToLevel: Level | null = null) {
	return proofMethods.filter(method => isUnlocked(method, upToLevel));
}

export default getUnlockedProofMethods;