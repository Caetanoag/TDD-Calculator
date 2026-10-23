import { describe, expect, test } from "bun:test";
import { LexError, Lexer } from "./lexer";
import {
	type ConstantToken,
	type FloatToken,
	type FunctionToken,
	type IntegerToken,
	type OperatorToken,
	type PunctToken,
	type Token,
	TokenType,
} from "./lexer.types";

const tokenize = (src: string): Token[] => new Lexer(src).tokenize();

const tokens = (src: string): Token[] => {
	const result = tokenize(src);
	expect(result.at(-1)?.type).toBe(TokenType.EOF);
	return result.slice(0, -1);
};

const getError = (src: string): LexError => {
	try {
		tokenize(src);
	} catch (e) {
		if (e instanceof LexError) return e;
		throw e;
	}
	throw new Error(`expected LexError for ${JSON.stringify(src)}, got none`);
};
const OPERATORS: Array<[string, TokenType]> = [
	["+", TokenType.Plus],
	["-", TokenType.Minus],
	["*", TokenType.Star],
	["/", TokenType.Slash],
	["^", TokenType.Caret],
	["%", TokenType.Percent],
];

const PUNCTUATION: Array<[string, TokenType]> = [
	["(", TokenType.LParen],
	[")", TokenType.RParen],
	[",", TokenType.Comma],
];

const FUNCTIONS = [
	"sin",
	"cos",
	"tan",
	"asin",
	"acos",
	"atan",
	"sqrt",
	"cbrt",
	"log",
	"ln",
	"log10",
	"log2",
	"exp",
	"abs",
	"floor",
	"ceil",
	"round",
] as const;

describe("Lexer", () => {
	describe("EOF", () => {
		test("empty input produces only EOF at 0:1:1", () => {
			const toks = tokenize("");
			expect(toks).toHaveLength(1);
			expect(toks[0]?.type).toBe(TokenType.EOF);
			expect(toks[0]?.pos).toEqual({ offset: 0, line: 1, col: 1 });
		});

		test("whitespace-only input produces only EOF", () => {
			const toks = tokenize("  \t\n\r ");
			expect(toks).toHaveLength(1);
			expect(toks[0]?.type).toBe(TokenType.EOF);
		});
	});
	describe("Integer", () => {
		test.each([
			["0", 0],
			["1", 1],
			["42", 42],
			["1234567890", 1234567890],
		])("'%s' → IntegerToken value %d", (src, value) => {
			const [tok] = tokens(src);
			expect(tok?.type).toBe(TokenType.Integer);
			expect((tok as IntegerToken).lexeme).toBe(src);
			expect((tok as IntegerToken).value).toBe(value);
		});
	});

	describe("Float", () => {
		test.each([
			["3.14", 3.14],
			["0.5", 0.5],
			["1.0", 1.0],
			["10.25", 10.25],
			["0.0", 0.0],
		])("'%s' → FloatToken value %d", (src, value) => {
			const [tok] = tokens(src);
			expect(tok?.type).toBe(TokenType.Float);
			expect((tok as FloatToken).lexeme).toBe(src);
			expect((tok as FloatToken).value).toBe(value);
		});
	});
	describe("Operators", () => {
		test.each(OPERATORS)("'%s' → %s", (src, expected) => {
			const [tok] = tokens(src);
			expect(tok?.type).toBe(expected);
			expect((tok as OperatorToken).lexeme).toBe(src);
		});
	});
	describe("Punctuation", () => {
		test.each(PUNCTUATION)("'%s' → %s", (src, expected) => {
			const [tok] = tokens(src);
			expect(tok?.type).toBe(expected);
			expect((tok as PunctToken).lexeme).toBe(src);
		});
	});

	describe("Constants", () => {
		test.each([
			["pi", Math.PI],
			["e", Math.E],
			["tau", Math.PI * 2],
		])("'%s' → ConstantToken", (name, value) => {
			const [tok] = tokens(name);
			expect(tok?.type).toBe(TokenType.Constant);
			expect((tok as ConstantToken).lexeme).toBe(name);
			expect((tok as ConstantToken).name).toBe(name);
			expect((tok as ConstantToken).value).toBeCloseTo(value, 12);
		});
	});
	describe("Functions", () => {
		test.each(FUNCTIONS)("'%s' → FunctionToken", (name) => {
			const [tok] = tokens(name);
			expect(tok?.type).toBe(TokenType.Function);
			expect((tok as FunctionToken).lexeme).toBe(name);
			expect((tok as FunctionToken).name).toBe(name);
		});

		test("'log10' lexes as a single token, not 'log' + '10'", () => {
			const toks = tokens("log10");
			expect(toks).toHaveLength(1);
			expect(toks[0]?.type).toBe(TokenType.Function);
			expect((toks[0] as FunctionToken).name).toBe("log10");
		});

		test("'log2' lexes as a single token", () => {
			const toks = tokens("log2");
			expect(toks).toHaveLength(1);
			expect((toks[0] as FunctionToken).name).toBe("log2");
		});
	});

	describe("Full expressions", () => {
		test("'1 + 2' → Integer Plus Integer", () => {
			const toks = tokens("1 + 2");
			expect(toks.map((t) => t.type)).toEqual([
				TokenType.Integer,
				TokenType.Plus,
				TokenType.Integer,
			]);
		});

		test("'sin(pi/2)' expands correctly", () => {
			const toks = tokens("sin(pi/2)");
			expect(toks.map((t) => t.type)).toEqual([
				TokenType.Function,
				TokenType.LParen,
				TokenType.Constant,
				TokenType.Slash,
				TokenType.Integer,
				TokenType.RParen,
			]);
		});

		test("'sin(1, 2)' — comma separates args", () => {
			const toks = tokens("sin(1, 2)");
			expect(toks.map((t) => t.type)).toEqual([
				TokenType.Function,
				TokenType.LParen,
				TokenType.Integer,
				TokenType.Comma,
				TokenType.Integer,
				TokenType.RParen,
			]);
		});

		test("mixed: '2*pi + e^2'", () => {
			const toks = tokens("2*pi + e^2");
			expect(toks.map((t) => t.type)).toEqual([
				TokenType.Integer,
				TokenType.Star,
				TokenType.Constant,
				TokenType.Plus,
				TokenType.Constant,
				TokenType.Caret,
				TokenType.Integer,
			]);
		});
	});
	describe("Whitespace handling", () => {
		test("spaces between tokens are skipped", () => {
			const toks = tokens("  1    +    2  ");
			expect(toks.map((t) => t.type)).toEqual([
				TokenType.Integer,
				TokenType.Plus,
				TokenType.Integer,
			]);
		});

		test("tabs, newlines, carriage returns are skipped", () => {
			const toks = tokens("\t1\n\r+\t2");
			expect(toks).toHaveLength(3);
		});
	});

	describe("Position tracking", () => {
		test("single token starts at 0:1:1", () => {
			const [tok] = tokenize("1");
			expect(tok?.pos).toEqual({ offset: 0, line: 1, col: 1 });
		});

		test("sequential tokens advance offset by one", () => {
			const toks = tokenize("1+2");
			expect(toks.map((t) => t.pos.offset)).toEqual([0, 1, 2, 3]);
		});

		test("col advances within a line", () => {
			const toks = tokens("1 2 3");
			expect(toks.map((t) => t.pos.col)).toEqual([1, 3, 5]);
		});

		test("line increments after newline; col resets", () => {
			const toks = tokens("1\n2");
			expect(toks[0]?.pos).toEqual({ offset: 0, line: 1, col: 1 });
			expect(toks[1]?.pos).toEqual({ offset: 2, line: 2, col: 1 });
		});

		test("position across multiple lines", () => {
			const toks = tokens("1\n2\n3");
			expect(toks.map((t) => t.pos)).toEqual([
				{ offset: 0, line: 1, col: 1 },
				{ offset: 2, line: 2, col: 1 },
				{ offset: 4, line: 3, col: 1 },
			]);
		});

		test("multi-character token records its start position", () => {
			const toks = tokens("1 + 3.14");
			const float = toks[2];
			expect(float?.pos).toEqual({ offset: 4, line: 1, col: 5 });
		});
	});
	describe("Unexpected characters", () => {
		test.each(["@", "#", "$", "&", "[", "]", "{", "}", "|", "~", "?"])(
			"rejects '%s' with LexError",
			(src) => {
				expect(() => tokenize(src)).toThrow(LexError);
			},
		);

		test("unexpected char error carries correct pos", () => {
			const err = getError("@");
			expect(err.pos).toEqual({ offset: 0, line: 1, col: 1 });
		});

		test("error on second line points at line 2", () => {
			const err = getError("1\n@");
			expect(err.pos.line).toBe(2);
		});

		test("error message embeds line:col", () => {
			const err = getError("1 + @");
			expect(err.message).toContain("1:5");
		});
	});

	describe("Unknown identifiers", () => {
		test("'foo' throws LexError", () => {
			expect(() => tokenize("foo")).toThrow(LexError);
		});

		test("'sine' throws LexError (not 'sin' + 'e')", () => {
			expect(() => tokenize("sine")).toThrow(LexError);
		});

		test("error pos points at the identifier start", () => {
			const err = getError("1 + foo");
			expect(err.pos.offset).toBe(4);
		});
	});

	describe("Malformed numbers", () => {
		test.each(["3.", ".5", "1.2.3", "1..2"])(
			"rejects '%s' with LexError",
			(src) => {
				expect(() => tokenize(src)).toThrow(LexError);
			},
		);

		test("'.5' errors at the dot (offset 0)", () => {
			const err = getError(".5");
			expect(err.pos).toEqual({ offset: 0, line: 1, col: 1 });
		});

		test("'3.' errors on line 1, after the integer part", () => {
			const err = getError("3.");
			expect(err.pos.line).toBe(1);
			expect(err.pos.offset).toBeGreaterThan(0);
		});

		test("'1.2.3' errors after the first float", () => {
			const err = getError("1.2.3");
			expect(err.pos.line).toBe(1);
			expect(err.pos.offset).toBeGreaterThanOrEqual(3);
		});
	});

	describe("Scientific notation is rejected", () => {
		test.each(["1e5", "1E5", "1.5e10", "1e+5", "1e-5"])(
			"rejects '%s' with LexError",
			(src) => {
				expect(() => tokenize(src)).toThrow(LexError);
			},
		);

		test("'1e5' errors on line 1", () => {
			const err = getError("1e5");
			expect(err.pos.line).toBe(1);
		});

		test("'1 e 5' (with spaces) is valid — adjacency broken", () => {
			const toks = tokens("1 e 5");
			expect(toks.map((t) => t.type)).toEqual([
				TokenType.Integer,
				TokenType.Constant,
				TokenType.Integer,
			]);
		});

		test("'1 e5' errors — the 'e' is glued to '5', and 'e5' is unknown", () => {
			expect(() => tokenize("1 e5")).toThrow(LexError);
		});
	});

	describe("Case sensitivity", () => {
		test.each(["PI", "E", "TAU", "Sin", "SIN", "COS", "LOG", "Log10"])(
			"rejects '%s' with LexError",
			(src) => {
				expect(() => tokenize(src)).toThrow(LexError);
			},
		);

		test("'PI' errors at the identifier start (offset 0)", () => {
			const err = getError("PI");
			expect(err.pos).toEqual({ offset: 0, line: 1, col: 1 });
		});

		test("'Sin(1)' errors at offset 0, not at the paren", () => {
			const err = getError("Sin(1)");
			expect(err.pos).toEqual({ offset: 0, line: 1, col: 1 });
		});

		test("lowercase 'sin' still works next to the error cases", () => {
			const toks = tokens("sin(pi)");
			expect(toks[0]?.type).toBe(TokenType.Function);
			expect((toks[0] as FunctionToken).name).toBe("sin");
		});
	});
});
