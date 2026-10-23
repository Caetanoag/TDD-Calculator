import { describe, expect, test } from "bun:test";
import { isAlpha, isDigit, isWhiteSpace } from "./utils";

const SYMBOLS = [
	"!",
	'"',
	"#",
	"$",
	"%",
	"&",
	"'",
	"(",
	")",
	"*",
	"+",
	",",
	"-",
	".",
	"/",
	":",
	";",
	"<",
	"=",
	">",
	"?",
	"@",
	"[",
	"\\",
	"]",
	"^",
	"`",
	"{",
	"|",
	"}",
	"~",
];
const WHITESPACES = [" ", "\t", "\n", "\r"];

const range = (from: number, to: number) =>
	Array.from({ length: to - from + 1 }, (_, i) =>
		String.fromCharCode(from + i),
	);

describe("isDigit", () => {
	test.each(range(48, 57))("accepts the digit '%s'", (digit) => {
		expect(isDigit(digit)).toBe(true);
	});

	test.each(range(65, 90))("rejects the upper letter '%s'", (char) => {
		expect(isDigit(char)).toBe(false);
	});

	test.each(range(97, 122))("rejects the lower letter '%s'", (char) => {
		expect(isDigit(char)).toBe(false);
	});

	test.each(SYMBOLS)("rejects the symbol '%s'", (symbol) => {
		expect(isDigit(symbol)).toBe(false);
	});

	test.each(WHITESPACES)("rejects whitespace %j", (ws) => {
		expect(isDigit(ws)).toBe(false);
	});

	test.each(["", "12", "0.5", "-1", " 1"])(
		"rejects invalid string %j",
		(input) => {
			expect(isDigit(input)).toBe(false);
		},
	);
});

describe("isAlpha", () => {
	test.each(range(65, 90))("accepts the upper letter '%s'", (char) => {
		expect(isAlpha(char)).toBe(true);
	});
	test.each(range(97, 122))("accepts the lower letter '%s'", (char) => {
		expect(isAlpha(char)).toBe(true);
	});

	test.each(range(48, 57))("rejects the digit '%s'", (digit) => {
		expect(isAlpha(digit)).toBe(false);
	});

	test.each(SYMBOLS)("rejects the symbol '%s'", (symbol) => {
		expect(isAlpha(symbol)).toBe(false);
	});

	test.each(WHITESPACES)("rejects whitespace %j", (ws) => {
		expect(isAlpha(ws)).toBe(false);
	});

	test.each(["", "ab", "á", "ñ", "ç"])("rejects invalid string %j", (input) => {
		expect(isAlpha(input)).toBe(false);
	});
});

describe("isWhiteSpace", () => {
	test.each(WHITESPACES)("accepts whitespace %j", (ws) => {
		expect(isWhiteSpace(ws)).toBe(true);
	});

	test.each(range(48, 57))("rejects the digit '%s'", (digit) => {
		expect(isWhiteSpace(digit)).toBe(false);
	});

	test.each(range(65, 90))("rejects the upper letter '%s'", (char) => {
		expect(isWhiteSpace(char)).toBe(false);
	});

	test.each(range(97, 122))("rejects the lower letter '%s'", (char) => {
		expect(isWhiteSpace(char)).toBe(false);
	});

	test.each(SYMBOLS)("rejects the symbol '%s'", (symbol) => {
		expect(isWhiteSpace(symbol)).toBe(false);
	});

	test.each(["", "  ", "a b"])("rejects invalid string %j", (input) => {
		expect(isWhiteSpace(input)).toBe(false);
	});
});
