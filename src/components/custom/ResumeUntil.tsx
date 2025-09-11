import type { Level } from "@/logic/Level";
import type Proof from "@/logic/Proof";

export interface ResumeUntilInput {
	condition: (level: Level | null, proof: Proof | null) => boolean;
	text: string;
}

function ResumeUntil(_: ResumeUntilInput) {
	return (<></>);
}

export default ResumeUntil;