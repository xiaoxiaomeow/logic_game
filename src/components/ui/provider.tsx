"use client"

import { I18nextProvider } from "react-i18next";
import {
	ColorModeProvider,
	type ColorModeProviderProps,
} from "./color-mode"
import i18n from './i18n';

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
	globalCss: {
		html: {
			colorPalette: "logic"
		},
		h1: {
			fontSize: "xl",
			fontWeight: 'bold'
		},
		h2: {
			fontSize: "lg",
			fontWeight: 'semibold'
		},
		h3: {
			fontSize: "md",
			fontWeight: 'medium'
		},
		ul: {
			listStyleType: "initial",
			paddingInlineStart: "20px",
		},
		em: { fontStyle: "italic" },
		code: {
			fontFamily: "monospace",
			backgroundColor: "logic.emphasized",
			padding: '4px 6px',
			borderRadius: '4px',
			fontSize: '100%',
		}
	},
	theme: {
		tokens: {
			colors: {
				logic: {
					50: { value: "#f5f0ff" },
					100: { value: "#e9d8fd" },
					200: { value: "#d6bcfa" },
					300: { value: "#b794f4" },
					400: { value: "#9f7aea" },
					500: { value: "#805ad5" },
					600: { value: "#6b46c1" },
					700: { value: "#553c9a" },
					800: { value: "#44337a" },
					900: { value: "#322659" },
					950: { value: "#1a103c" },
				},
				red: {
					50: { value: "#fef0f0" },
					100: { value: "#fdd8d8" },
					200: { value: "#fabcbc" },
					300: { value: "#f49494" },
					400: { value: "#ea7a7a" },
					500: { value: "#d55a5a" },
					600: { value: "#c14646" },
					700: { value: "#9a3c3c" },
					800: { value: "#7a3333" },
					900: { value: "#592626" },
					950: { value: "#3c1010" }
				},
				blue: {
					50: { value: "#f0f5ff" },
					100: { value: "#d8e9fd" },
					200: { value: "#bcd6fa" },
					300: { value: "#94b7f4" },
					400: { value: "#7a9aea" },
					500: { value: "#5a80d5" },
					600: { value: "#466bc1" },
					700: { value: "#3c559a" },
					800: { value: "#33447a" },
					900: { value: "#263259" },
					950: { value: "#101a3c" }
				},
				pink: {
					50: { value: "#fef0f8" },
					100: { value: "#fdd8f5" },
					200: { value: "#fabcf0" },
					300: { value: "#f494e4" },
					400: { value: "#ea7ad4" },
					500: { value: "#d55abf" },
					600: { value: "#c146a9" },
					700: { value: "#9a3c84" },
					800: { value: "#7a3368" },
					900: { value: "#59264d" },
					950: { value: "#3c1026" }
				},
				yellow: {
					50: { value: "#fefce8" },
					100: { value: "#fef9c3" },
					200: { value: "#fef08a" },
					300: { value: "#fde047" },
					400: { value: "#facc15" },
					500: { value: "#eab308" },
					600: { value: "#ca8a04" },
					700: { value: "#a16207" },
					800: { value: "#854d0e" },
					900: { value: "#713f12" },
					950: { value: "#422006" }
				},
				green: {
					50: { value: "#f0fdf4" },
					100: { value: "#dcfce7" },
					200: { value: "#bbf7d0" },
					300: { value: "#86efac" },
					400: { value: "#4ade80" },
					500: { value: "#22c55e" },
					600: { value: "#16a34a" },
					700: { value: "#15803d" },
					800: { value: "#166534" },
					900: { value: "#14532d" },
					950: { value: "#052e16" }
				}
			}
		},
		semanticTokens: {
			colors: {
				logic: {
					solid: {
						value: { base: "{colors.logic.600}", _dark: "{colors.logic.400}" }
					},
					contrast: {
						value: { base: "white", _dark: "black" }
					},
					fg: {
						value: { base: "{colors.logic.700}", _dark: "{colors.logic.200}" }
					},
					muted: {
						value: { base: "{colors.logic.100}", _dark: "{colors.logic.800}" }
					},
					subtle: {
						value: { base: "{colors.logic.200}", _dark: "{colors.logic.700}" }
					},
					emphasized: {
						value: { base: "{colors.logic.300}", _dark: "{colors.logic.500}" }
					},
					focusRing: {
						value: { base: "{colors.logic.600}", _dark: "{colors.logic.400}" }
					},
					star: {
						value: { base: "{colors.pink.200}", _dark: "{colors.pink.800}" }
					},
					sapphire: {
						value: { base: "{colors.blue.200}", _dark: "{colors.blue.800}" }
					},
					author: {
						value: { base: "{colors.logic.200}", _dark: "{colors.logic.800}" }
					},
					star_text: {
						value: { base: "{colors.pink.700}", _dark: "{colors.pink.100}" }
					},
					sapphire_text: {
						value: { base: "{colors.blue.700}", _dark: "{colors.blue.100}" }
					}
				}
			}
		}
	}
});

const system = createSystem(defaultConfig, config);

export function Provider(props: ColorModeProviderProps) {
	return (
		<I18nextProvider i18n={i18n}>
			<ChakraProvider value={system}>
				<ColorModeProvider {...props} />
			</ChakraProvider>
		</I18nextProvider>
	)
}
