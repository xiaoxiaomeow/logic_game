import { Box } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export interface LocalizedMarkdownInput {
	locale: string;
	children: ReactNode;
}

function LocalizedMarkdown(props: LocalizedMarkdownInput) {
	const locale = useTranslation().i18n.language;
	return (
		<Box hidden={locale !== props.locale}>
			{props.children}
		</Box>
	);
}

export default LocalizedMarkdown;