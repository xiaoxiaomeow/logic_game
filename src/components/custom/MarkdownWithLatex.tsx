import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface MathComponents extends Components {
	math?: React.ElementType;
	inlineMath?: React.ElementType;
}

interface MarkdownWithLatexProps {
}

const MarkdownWithLatex: React.FC<MarkdownWithLatexProps> = (props) => {
	const components: MathComponents = {
		math: ({ value }) => <BlockMath math={value} />,
		inlineMath: ({ value }) => <InlineMath math={value} />,
	};

	return (
		<ReactMarkdown
			{...props}
			remarkPlugins={[remarkMath]}
			rehypePlugins={[rehypeKatex]}
			components={components}
		/>
	);
};

export default MarkdownWithLatex;