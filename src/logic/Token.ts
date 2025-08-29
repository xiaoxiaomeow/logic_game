export function Tokenize(code: string): string[] {
	const cleaned = code.replace(/\s+/g, '');
	const tokens: string[] = [];
	let i: number = 0;
	while (i < cleaned.length) {
		if (cleaned[i] === '(' || cleaned[i] === ')') {
			tokens.push(cleaned[i]);
			i++;
		} else if (cleaned.startsWith('->', i)) {
			tokens.push('->');
			i += 2;
		} else if (cleaned[i] === '!') {
			tokens.push('!');
			i++;
		} else if (cleaned[i] === '"') {
			let variable = '';
			variable += cleaned[i];
			i++;
			while (i < cleaned.length && cleaned[i] !== '"') {
				variable += cleaned[i];
				i++;
			}
			if (i < cleaned.length && cleaned[i] === '"') {
				variable += cleaned[i];
				i++;
			}
			tokens.push(variable);
		} else if (/[a-zA-Z]/.test(cleaned[i])) {
			let variable = "'";
			variable += cleaned[i];
			i++;
			while (i < cleaned.length && /[a-zA-Z0-9_^]/.test(cleaned[i])) {
				variable += cleaned[i];
				i++;
			}
			tokens.push(variable + "'");
		}
	}
	return tokens;
}

export function TokenizeCommand(command: string): string[] {
	const tokens: string[] = [];
	let currentToken = '';
	let insideQuotes = false;
	let escapeNext = false;

	for (let i = 0; i < command.length; i++) {
		const char = command[i];
		if (escapeNext) {
			currentToken += char;
			escapeNext = false;
			continue;
		}
		if (char === '\\') {
			escapeNext = true;
			continue;
		}
		if (char === '"') {
			if (insideQuotes) {
				tokens.push(`"${currentToken}"`);
				currentToken = '';
				insideQuotes = false;
			} else {
				if (currentToken.trim()) {
					tokens.push(currentToken.trim());
				}
				currentToken = '';
				insideQuotes = true;
			}
			continue;
		}

		if (insideQuotes) {
			currentToken += char;
		} else {
			if (char === ' ') {
				if (currentToken.trim()) {
					tokens.push(currentToken.trim());
					currentToken = '';
				}
			} else {
				currentToken += char;
			}
		}
	}

	if (currentToken.trim()) {
		tokens.push(currentToken.trim());
	}

	return tokens;
}