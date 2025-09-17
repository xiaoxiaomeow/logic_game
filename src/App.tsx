import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from '@/components/custom/Layout';
import LevelSelectorPage from '@/views/LevelSelector';
import LevelProverPage from './views/LevelProver';
import { GlobalKeyListener } from './components/custom/GlobalKeyListener';
import { useEffect } from 'react';

function App() {
	const listner = GlobalKeyListener;
	useEffect(() => {
		window.addEventListener('keydown', listner);
		return () => {
			window.removeEventListener('keydown', listner);
		};
	}, [listner]);
	return (
		<HashRouter>
			<Routes>
				<Route path="/" element={<Layout></Layout>}>
					<Route index element={<LevelSelectorPage></LevelSelectorPage>}></Route>
					<Route path="level/:chapterId/:levelId" element={<LevelProverPage></LevelProverPage>}></Route>
				</Route>
			</Routes>
		</HashRouter>
	);
}

export default App;
