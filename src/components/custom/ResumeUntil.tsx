import type Proof from "@/logic/Proof";

export interface ResumeUntilInput {
	condition: (proof: Proof | null) => boolean;
	text: string;
}

function ResumeUntil(_: ResumeUntilInput) {
	return (<></>);
}

export default ResumeUntil;