export const isDigit = (c: string | undefined) =>
	c !== undefined && c.length === 1 && c >= "0" && c <= "9";
export const isAlpha = (c: string | undefined) =>
	c !== undefined && /^[a-zA-Z_]$/.test(c);
export const isAlphaNumeric = (c: string | undefined) =>
	isAlpha(c) || isDigit(c);
export const isWhiteSpace = (c: string) =>
	c === " " || c === "\t" || c === "\n" || c === "\r";
