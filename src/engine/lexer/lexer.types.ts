export enum TokenType {
	Integer = "Integer",
	Float = "Float",
	Plus = "Plus",
	Minus = "Minus",
	Star = "Star",
	Slash = "Slash",
	Caret = "Caret",
	Percent = "Percent",
	LParen = "LParen",
	RParen = "RParen",
	Comma = "Comma",
	Function = "Function",
	Constant = "Constant",
	EOF = "EOF",
}

export type Position = {
	offset: number;

	line: number;
	col: number;
};

type BaseToken<T extends TokenType> = {
	type: T;
	pos: Position;
};

export type IntegerToken = BaseToken<TokenType.Integer> & {
	lexeme: string;
	value: number;
};

export type FloatToken = BaseToken<TokenType.Float> & {
	lexeme: string;
	value: number;
};

export type FunctionToken = BaseToken<TokenType.Function> & {
	lexeme: string;
	name: string;
};

export type ConstantToken = BaseToken<TokenType.Constant> & {
	lexeme: string;
	name: string;
	value: number;
};

export type OperatorToken = BaseToken<
	| TokenType.Plus
	| TokenType.Minus
	| TokenType.Star
	| TokenType.Slash
	| TokenType.Caret
	| TokenType.Percent
> & {
	lexeme: string;
};

export type PunctToken = BaseToken<
	TokenType.LParen | TokenType.RParen | TokenType.Comma
> & {
	lexeme: string;
};
export type EOFToken = BaseToken<TokenType.EOF>;

export type Token =
	| IntegerToken
	| FloatToken
	| FunctionToken
	| ConstantToken
	| OperatorToken
	| PunctToken
	| EOFToken;
