import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from "vite-tsconfig-paths";
import mdx from '@mdx-js/rollup';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://vite.dev/config/
export default defineConfig({
	plugins: [mdx({
		rehypePlugins: [rehypeKatex],
		remarkPlugins: [remarkMath],
	}), react(), tsconfigPaths()],
	base: '/logic_game/'
})
