import {
	type ConstantToken,
	type EOFToken,
	type FloatToken,
	type FunctionToken,
	type IntegerToken,
	type OperatorToken,
	type Position,
	type PunctToken,
	type Token,
	TokenType,
} from "./lexer.types";
import { isAlpha, isAlphaNumeric, isDigit, isWhiteSpace } from "./utils";

export class LexError extends Error {
	public readonly pos: Position;
	constructor(message: string, pos: Position) {
		super(`${message} (${pos.line}:${pos.col})`);
		this.name = "LexError";
		this.pos = pos;
	}
}

const CONSTANTS = new Map<string, number>([
	["pi", Math.PI],
	["e", Math.E],
	["tau", Math.PI * 2],
]);
const FUNCTIONS = new Set<string>([
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
]);

export class Lexer {
	public readonly input: string;
	private offset: number;
	private line: number;
	private col: number;

	constructor(input: string) {
		this.input = input;
		this.offset = 0;
		this.line = 1;
		this.col = 1;
	}

	public tokenize(): Token[] {
		const tokens: Token[] = [];

		while (this.offset < this.input.length) {
			const c = this.input[this.offset];
			if (c === undefined) break;
			if (isWhiteSpace(c)) {
				this.advance(1);
				continue;
			}
			if (isDigit(c)) {
				tokens.push(this.scanNumber());
				continue;
			}

			if (isAlpha(c)) {
				tokens.push(this.scanIdentifier());
				continue;
			}

			const token = this.scanSingleChar(c, this.currentPos());
			this.advance(1);
			tokens.push(token);
		}

		tokens.push({
			type: TokenType.EOF,
			pos: this.currentPos(),
		} satisfies EOFToken);

		return tokens;
	}

	private scanNumber(): IntegerToken | FloatToken {
		const pos = this.currentPos();
		const start = this.offset;
		let idx = this.offset;

		while (isDigit(this.input[idx])) {
			idx++;
		}
		let isFloat = false;
		if (this.input[idx] === "." && isDigit(this.input[idx + 1])) {
			isFloat = true;
			idx++;
			while (isDigit(this.input[idx])) {
				idx++;
			}
		}
		const next = this.input[idx];
		if (next !== undefined && isAlpha(next)) {
			throw new LexError(`Unexpected letter '${next}' after number`, {
				offset: idx,
				line: this.line,
				col: this.col + (idx - start),
			});
		}
		const lexeme = this.input.slice(start, idx);
		const value = Number(lexeme);
		this.advance(idx - start);

		return isFloat
			? { type: TokenType.Float, lexeme, value, pos }
			: { type: TokenType.Integer, lexeme, value, pos };
	}

	private scanIdentifier(): FunctionToken | ConstantToken {
		const pos = this.currentPos();
		const start = this.offset;
		let idx = this.offset;

		while (isAlphaNumeric(this.input[idx])) {
			idx++;
		}

		const lexeme = this.input.slice(start, idx);
		const name = lexeme;
		this.advance(idx - start);

		const constantValue = CONSTANTS.get(name);
		if (constantValue !== undefined) {
			return {
				type: TokenType.Constant,
				lexeme,
				name,
				value: constantValue,
				pos,
			};
		}

		if (FUNCTIONS.has(name)) {
			return { type: TokenType.Function, lexeme, name, pos };
		}

		throw new LexError(`Unknow Identifier '${lexeme}'`, pos);
	}

	private scanSingleChar(c: string, pos: Position): OperatorToken | PunctToken {
		switch (c) {
			case "+":
				return { type: TokenType.Plus, lexeme: c, pos };
			case "-":
				return { type: TokenType.Minus, lexeme: c, pos };
			case "*":
				return { type: TokenType.Star, lexeme: c, pos };
			case "/":
				return { type: TokenType.Slash, lexeme: c, pos };
			case "^":
				return { type: TokenType.Caret, lexeme: c, pos };
			case "%":
				return { type: TokenType.Percent, lexeme: c, pos };
			case "(":
				return { type: TokenType.LParen, lexeme: c, pos };
			case ")":
				return { type: TokenType.RParen, lexeme: c, pos };
			case ",":
				return { type: TokenType.Comma, lexeme: c, pos };
			default:
				throw new LexError(`Unexpected character '${c}'`, pos);
		}
	}
	private advance(n: number): void {
		for (let i = 0; i < n; i++) {
			const c = this.input[this.offset + i];
			if (c === "\n") {
				this.line++;
				this.col = 1;
			} else {
				this.col++;
			}
		}
		this.offset += n;
	}

	private currentPos(): Position {
		return { offset: this.offset, line: this.line, col: this.col };
	}
}
