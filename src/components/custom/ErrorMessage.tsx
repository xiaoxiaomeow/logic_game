import { useUIStore } from "@/contexts/UIStore";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import MarkdownWithLatex from "./MarkdownWithLatex";

function ErrorMessage() {
	const errorMessage: string = useUIStore(state => state.errorMessage);
	const t = useTranslation().t;
	if (!errorMessage) return null;
	return (
		<VStack width="100%" background="logic.subtle" gap="0">
			<Flex width="100%" justifyContent="center" padding="4px 4px" background="logic.emphasized">
				<Text>{t("ErrorMessage.Title")}</Text>
			</Flex>
			<Box color="red">
				<MarkdownWithLatex>{errorMessage}</MarkdownWithLatex>
			</Box>
		</VStack>
	);
}

export default ErrorMessage;