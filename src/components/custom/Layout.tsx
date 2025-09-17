import { HStack, VStack } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';

import Header from './Header';
import type { ReactNode } from 'react';

function Layout() {
	return (
		<VStack height="100%" gap="0">
			<Header></Header>
			<Outlet></Outlet>
		</VStack>
	);
}

export function LayoutStackMain(props: { children: ReactNode }) {
	return (<HStack align="center" width="100%" height="100%" overflowY="auto">{props.children}</HStack>);
}
export function LayoutStackLeft(props: { children: ReactNode }) {
	return (<VStack width={{ lg: "30%", base: "100%" }} height="100%">{props.children}</VStack>);
}
export function LayoutStackMiddle(props: { children: ReactNode }) {
	return (<VStack width={{ lg: "40%", base: "100%" }} height="100%">{props.children}</VStack>);
}
export function LayoutStackRight(props: { children: ReactNode }) {
	return (<VStack width={{ lg: "30%", base: "100%" }} height="100%" gap="0" >{props.children}</VStack>);
}

export default Layout;