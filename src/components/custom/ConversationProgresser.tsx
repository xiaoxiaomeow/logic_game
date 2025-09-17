import { useUIStore } from "@/contexts/UIStore";
import { Box, Text, VStack } from "@chakra-ui/react";
import type { MouseEventHandler, ReactNode } from "react";
import React, { useEffect } from "react";
import Speak from "./Speak";
import ResumeUntil, { type ResumeUntilInput } from "./ResumeUntil";
import type Proof from "@/logic/Proof";
import { useTranslation } from "react-i18next";
import type { Level } from "@/logic/Level";

function ConversationProgresser(props: { children: ReactNode }) {
	const setConversationProgress: (progress: number) => void = useUIStore(state => state.setConversationProgress);
	const conversationProgress: number = useUIStore(state => state.conversationProgress);
	const proofs: Proof[] = useUIStore(state => state.proofs);
	const displayingIndex: number = useUIStore(state => state.displayingIndex);
	const proof: Proof | null = displayingIndex >= 0 ? proofs[displayingIndex] : null;
	const level: Level | null = useUIStore(state => state.level);
	const children: ReactNode[] = React.Children.toArray(props.children);
	useEffect(() => {
		let progress: number = conversationProgress;
		let child = children[progress];
		while (React.isValidElement(child) && child.type === ResumeUntil) {
			const condition: ((level: Level | null, proof: Proof | null) => boolean) = (child.props as ResumeUntilInput).condition;
			if (condition != null && !condition(level, proof)) break;
			progress++;
			child = children[progress];
		}
		setConversationProgress(progress);
	}, [proof]);
	const handler: MouseEventHandler = _ => {
		let progress: number = conversationProgress;
		let child = children[progress];
		if (React.isValidElement(child) && child.type === ResumeUntil) {
			const condition: ((level: Level | null, proof: Proof | null) => boolean) = (child.props as ResumeUntilInput).condition;
			if (condition != null && !condition(level, proof)) return;
		}
		progress += 2;
		child = children[progress];
		while (React.isValidElement(child) && child.type === ResumeUntil) {
			const condition: ((level: Level | null, proof: Proof | null) => boolean) = (child.props as ResumeUntilInput).condition;
			if (condition != null && !condition(level, proof)) break;
			progress++;
			child = children[progress];
		}
		progress -= 1;
		setConversationProgress(progress);
	}
	const t = useTranslation().t;
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
										return (<Text key="continue">{t("ConversationProgresser.ClickToContinue")}</Text>);
									}
									else {
										display = false;
										return null;
									}
								}
								else if (child.type === ResumeUntil) {
									const condition: ((level: Level | null, proof: Proof | null) => boolean) = (child.props as ResumeUntilInput).condition;
									if (condition != null && !condition(level, proof)) {
										display = false;
										return (<Text key="continue">{t((child.props as ResumeUntilInput).text)}</Text>);
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