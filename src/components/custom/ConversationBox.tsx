import { ScrollArea, VStack } from "@chakra-ui/react";
import { type ReactNode } from "react";
import { useStickToBottom, type StickToBottomInstance } from "use-stick-to-bottom"

function ConversationBox(props: { children: ReactNode }) {
	const sticky: StickToBottomInstance = useStickToBottom();
	return (
		<VStack background="logic.muted" width="100%" height="100%" padding="8px 0px">
			<ScrollArea.Root height="100%">
				<ScrollArea.Viewport ref={sticky.scrollRef} height="100%">
					<ScrollArea.Content ref={sticky.contentRef} height="100%">
						{props.children}
					</ScrollArea.Content>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar orientation="horizontal" />
				<ScrollArea.Scrollbar orientation="vertical" />
				<ScrollArea.Corner />
			</ScrollArea.Root>
		</VStack>
	);
}

export default ConversationBox;