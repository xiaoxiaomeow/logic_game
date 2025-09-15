import { Span } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

function Topaz() {
	const t = useTranslation().t;
	return (
		<Span fontWeight="bold" color="logic.topaz_text">{t("Character.Topaz.Name")}</Span>
	);
}

export default Topaz;