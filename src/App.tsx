import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '@/components/custom/Layout';
import LevelSelectorPage from '@/views/LevelSelector';
import LevelProverPage from './views/LevelProver';

function App() {
	return (
		<BrowserRouter basename="/logic_game/">
			<Routes>
				<Route path="/" element={<Layout></Layout>}>
					<Route index element={<LevelSelectorPage></LevelSelectorPage>}></Route>
					<Route path="level/:worldId/:levelId" element={<LevelProverPage></LevelProverPage>}></Route>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
