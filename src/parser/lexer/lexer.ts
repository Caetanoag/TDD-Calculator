const isDigit = (c: string) => c.length === 1 && c >= "0" && c <= "9";
const isAlpha = (c: string) => /^[a-zA-Z]$/.test(c);
const isWhiteSpace = (c: string) =>
	c === " " || c === "\t" || c === "\n" || c === "\r";
