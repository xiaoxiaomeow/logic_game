import { ScrollArea, VStack } from "@chakra-ui/react";
import { type ReactNode } from "react";
import { useStickToBottom, type StickToBottomInstance } from "use-stick-to-bottom"

function ConversationBox(props: { children: ReactNode }) {
	const sticky: StickToBottomInstance = useStickToBottom();
	return (
		<VStack background="logic.muted" width="100%" height="100%" position="relative" padding="8px 0px" overflowX="auto">
			<ScrollArea.Root>
				<ScrollArea.Viewport ref={sticky.scrollRef}>
					<ScrollArea.Content ref={sticky.contentRef} height="100%">
						{props.children}
					</ScrollArea.Content>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar orientation="vertical" />
			</ScrollArea.Root>
		</VStack>
	);
}

export default ConversationBox;