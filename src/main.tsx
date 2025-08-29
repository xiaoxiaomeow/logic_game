import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from "./components/ui/provider.tsx";
import 'katex/dist/katex.min.css';
import App from './App.tsx';
import { Box } from '@chakra-ui/react';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<Provider>
			<Box height="dvh">
				<App />
			</Box>
		</Provider>
	</StrictMode>,
);
