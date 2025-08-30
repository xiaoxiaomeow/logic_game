import { Grid, GridItem, Heading, HStack, IconButton, Menu } from "@chakra-ui/react";
import { useColorMode } from "../ui/color-mode";
import { useNavigate } from 'react-router-dom';
import { BsSun, BsMoon } from "react-icons/bs";
import { AiOutlineHome } from "react-icons/ai";
import { useUIStore } from "@/contexts/UIStore";
import { useTranslation } from "react-i18next";
import { IoLanguage } from "react-icons/io5";

function Header() {
	const { toggleColorMode, colorMode } = useColorMode();
	const navigate = useNavigate();
	const chapterName: string = useUIStore(state => state.chapterName);
	const levelName: string = useUIStore(state => state.levelName);
	const t = useTranslation().t;
	return (
		<Grid width="100%" alignItems="center" templateColumns="1fr auto 1fr" background="logic.solid" color="logic.contrast" padding="6px 6px">
			<GridItem justifySelf="start">
				<HStack>
					<IconButton onClick={() => navigate("/")} variant="ghost" color="logic.contrast"><AiOutlineHome /></IconButton>
					<Heading>{t(chapterName)}</Heading>
				</HStack>
			</GridItem>
			<GridItem justifySelf="center">
				<Heading>{t(levelName)}</Heading>
			</GridItem>
			<GridItem justifySelf="end">
				<HStack>
					<IconButton onClick={toggleColorMode} variant="ghost" color="logic.contrast">
						{colorMode === "light" ? <BsSun /> : <BsMoon />}
					</IconButton>
					<LanguageSwitcher />
				</HStack>
			</GridItem>
		</Grid>
	);
}

const locales = [
	{ label: "English", value: "en" },
	{ label: "简体中文", value: "zh" }
]

function LanguageSwitcher() {
	const { i18n } = useTranslation();
	return (
		<Menu.Root onSelect={e => i18n.changeLanguage(e.value)}>
			<Menu.Trigger>
				<IconButton variant="ghost" color="logic.contrast">
					<IoLanguage />
				</IconButton>
			</Menu.Trigger>
			<Menu.Positioner>
				<Menu.Content >
					{locales.map(locale => (
						<Menu.Item value={locale.value} key={locale.value}>{locale.label}</Menu.Item>
					))}
				</Menu.Content>
			</Menu.Positioner>
		</Menu.Root>
	);
}

export default Header;