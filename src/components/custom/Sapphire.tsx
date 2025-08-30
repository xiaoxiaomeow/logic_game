import { Span } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

function Sapphire() {
	const t = useTranslation().t;
	return (
		<Span fontWeight="bold" color="logic.sapphire_text">{t("Character.Sapphire.Name")}</Span>
	);
}

export default Sapphire;