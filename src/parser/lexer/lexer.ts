export const isDigit = (c: string) => c.length === 1 && c >= "0" && c <= "9";
export const isAlpha = (c: string) => /^[a-zA-Z]$/.test(c);
export const isWhiteSpace = (c: string) =>
	c === " " || c === "\t" || c === "\n" || c === "\r";
