import { useUIStore } from "@/contexts/UIStore";
import { Box, Text, VStack } from "@chakra-ui/react";
import type { MouseEventHandler, ReactNode } from "react";
import React, { useEffect } from "react";
import Speak from "./Speak";
import ResumeUntil, { type ResumeUntilInput } from "./ResumeUntil";
import type Proof from "@/logic/Proof";

function ConversationProgresser(props: { children: ReactNode }) {
	const resetConversationProgress: () => void = useUIStore(state => state.resetConversationProgress);
	const increaseConversationProgress: () => void = useUIStore(state => state.increaseConversationProgress);
	const setConversationProgress: (progress: number) => void = useUIStore(state => state.setConversationProgress);
	const conversationProgress: number = useUIStore(state => state.conversationProgress);
	const proof: Proof | null = useUIStore(state => state.proof);
	const handler: MouseEventHandler = _ => {
		increaseConversationProgress();
	};
	useEffect(() => { resetConversationProgress(); }, []);
	useEffect(() => {
		let maxIndex = -1;
		let display = true;
		React.Children.toArray(props.children).forEach((child: ReactNode, index) => {
			if (React.isValidElement(child) && display) {
				if (child.type === ResumeUntil) {
					const condition: ((proof: Proof | null) => boolean) = (child.props as ResumeUntilInput).condition;
					if (condition != null && !condition(proof)) display = false;
					else maxIndex = Math.max(maxIndex, index);
				}
			}
		});
		if (conversationProgress <= maxIndex) setConversationProgress(maxIndex + 1);
	}, [proof]);
	return (
		<VStack onClick={handler} height="100%">
			{
				(() => {
					let display = true;
					return React.Children.toArray(props.children)
						.map((child: ReactNode, index) => {
							if (React.isValidElement(child) && display) {
								if (child.type === Speak) {
									if (index <= conversationProgress) return (<Box key={index} width="100%">{child}</Box>);
									else if (index == conversationProgress + 1) {
										display = false;
										return (<Text key="continue">Click to continue ...</Text>);
									}
									else {
										display = false;
										return null;
									}
								}
								else if (child.type === ResumeUntil) {
									const condition: ((proof: Proof | null) => boolean) = (child.props as ResumeUntilInput).condition;
									if (condition != null && !condition(proof)) {
										display = false;
										return (<Text key="continue">{(child.props as ResumeUntilInput).text}</Text>);
									}
									return null;
								}
							}
							else return null;
						});
				})()
			}
		</VStack>
	);
}
export default ConversationProgresser;