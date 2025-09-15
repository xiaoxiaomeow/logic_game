import { Box, Flex } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface SpeakInput {
	speaker: string;
	children: ReactNode;
}

function Speak(speakInput: SpeakInput) {
	return (
		<Flex direction="row" justifyContent={{ "author": "stretch", "star": "flex-end", "sapphire": "flex-start", "topaz": "center" }[speakInput.speaker]} width="100%">
			<Box
				borderRadius="md"
				background={{ "author": "logic.author", "star": "logic.star", "sapphire": "logic.sapphire", "topaz": "logic.topaz" }[speakInput.speaker]}
				marginLeft={{ "author": "8px", "star": "24px", "sapphire": "8px", "topaz": "24px" }[speakInput.speaker]}
				marginRight={{ "author": "8px", "star": "8px", "sapphire": "24px", "topaz": "24px" }[speakInput.speaker]}
				width={{ "author": "100%", "star": "fit-content", "sapphire": "fit-content", "topaz": "fit-content" }[speakInput.speaker]}
				padding="8px">
				{speakInput.children}
			</Box>
		</Flex>
	);
}

export default Speak;