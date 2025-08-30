import { Span } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

function Star() {
	const t = useTranslation().t;
	return (
		<Span fontWeight="bold" color="logic.star_text">{t("Character.Star.Name")}</Span>
	);
}

export default Star;