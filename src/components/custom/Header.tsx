import { Grid, GridItem, Heading, HStack, IconButton } from "@chakra-ui/react";
import { useColorMode } from "../ui/color-mode";
import { useNavigate } from 'react-router-dom';
import { BsSun, BsMoon } from "react-icons/bs";
import { AiOutlineHome } from "react-icons/ai";
import { useUIStore } from "@/contexts/UIStore";

function Header() {
	const { toggleColorMode, colorMode } = useColorMode();
	const navigate = useNavigate();
	const worldName: string = useUIStore(state => state.worldName);
	const levelName: string = useUIStore(state => state.levelName);
	return (
		<Grid width="100%" alignItems="center" templateColumns="1fr auto 1fr" background="logic.solid" color="logic.contrast" padding="6px 6px">
			<GridItem justifySelf="start">
				<HStack>
					<IconButton onClick={() => navigate("/")} variant="ghost" color="logic.contrast"><AiOutlineHome /></IconButton>
					<Heading>{worldName}</Heading>
				</HStack>
			</GridItem>
			<GridItem justifySelf="center">
				<Heading>{levelName}</Heading>
			</GridItem>
			<GridItem justifySelf="end">
				<IconButton onClick={toggleColorMode} variant="ghost" color="logic.contrast">
					{colorMode === "light" ? <BsSun /> : <BsMoon />}
				</IconButton>
			</GridItem>
		</Grid>
	);
}

export default Header;