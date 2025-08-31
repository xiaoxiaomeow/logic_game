import { getLevelStateUsingKey } from "./LevelState";
import type Proof from "./Proof";

export class ProofMethod {
	name: string;
	getCommand: (proof: Proof) => string;
	prereq: string[];
	constructor(name: string, getCommand: (proof: Proof) => string, prereq: string[]) {
		this.name = name;
		this.getCommand = getCommand;
		this.prereq = prereq;
	}
}

const proofMethods = [
	new ProofMethod("ProofMethod.Axiom.Name", _ => "axiom ", ["00_propositional_logic/00_axiom"]),
	new ProofMethod("ProofMethod.Deduction.Name", _ => "deduction ", ["00_propositional_logic/00_axiom"]),
];

function getUnlockedProofMethods() {
	return proofMethods.filter(method => method.prereq.every(key => getLevelStateUsingKey(key) === "complete"));
}

export default getUnlockedProofMethods;