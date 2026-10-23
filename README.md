# TDD-Calculator

A command-line calculator written in TypeScript and built with [Bun](https://bun.sh), developed test-first with Test-Driven Development.

> **Status:** under active development. The lexer is complete and fully tested; the parser, evaluator, and CLI are next.

## Features

- Tokenizes integers, floats, operators, parentheses, commas, functions, and constants.
- Tracks source positions (`offset`, `line`, `column`) for every token.
- Reports malformed input with a descriptive `LexError` that includes the exact location.
- Strict numeric and identifier rules to keep parsing unambiguous.
- A comprehensive [Bun](https://bun.sh) test suite covering happy paths, edge cases, and error handling.

## Requirements

- [Bun](https://bun.sh) 1.x

## Getting started
Clone the repo:

```bash
git clone https://github.com/caetanoag/tdd-calculator.git
cd tdd-calculator.git
```

Install dependencies:

```bash
bun install
```

Run the test suite:

```bash
bun test
```

Run the type checker:

```bash
bun run typecheck
```

## Usage

The CLI entry point (`src/main.ts`) is not implemented yet. Until then, the lexer can be used directly as a library:

```ts
import { Lexer } from "./src/parser/lexer/lexer";

const tokens = new Lexer("sin(pi / 2) + 3.5").tokenize();
console.log(tokens);
```

The result is a list of tokens terminated by an `EOF` token:

```text
Function(sin)  LParen  Constant(pi)  Slash  Integer(2)  RParen  Plus  Float(3.5)  EOF
```

Every token carries the `Position` at which it starts:

```ts
type Position = {
  offset: number;
  line: number;
  col: number;
};
```

### Handling errors

Invalid input throws a `LexError` whose message ends with `(line:col)`:

```ts
import { Lexer, LexError } from "./src/parser/lexer/lexer";

try {
  new Lexer("1 + @").tokenize();
} catch (error) {
  if (error instanceof LexError) {
    console.error(error.message); // Unexpected character '@' (1:5)
    console.error(error.pos);     // { offset: 4, line: 1, col: 5 }
  }
}
```

## Language reference

### Numbers

| Form    | Pattern          | Examples         |
| ------- | ---------------- | ---------------- |
| Integer | `[0-9]+`         | `0`, `42`, `123` |
| Float   | `[0-9]+\.[0-9]+` | `3.14`, `0.5`    |

Numbers must have digits on both sides of the decimal point. Leading dots (`.5`), trailing dots (`3.`), and scientific notation (`1e5`) are rejected by design.

### Operators

| Symbol | Meaning                |
| ------ | ---------------------- |
| `+`    | Addition               |
| `-`    | Subtraction            |
| `*`    | Multiplication         |
| `/`    | Division               |
| `^`    | Exponentiation         |
| `%`    | Modulo / percentage    |

### Grouping and punctuation

| Symbol | Meaning                          |
| ------ | -------------------------------- |
| `(`    | Open parenthesis                 |
| `)`    | Close parenthesis                |
| `,`    | Argument separator               |

### Constants

| Name  | Value      |
| ----- | ---------- |
| `pi`  | `Math.PI`  |
| `e`   | `Math.E`   |
| `tau` | `2 * Math.PI` |

### Functions

| Category      | Functions                                |
| ------------- | ---------------------------------------- |
| Trigonometric | `sin`, `cos`, `tan`, `asin`, `acos`, `atan` |
| Roots & logs  | `sqrt`, `cbrt`, `log`, `ln`, `log10`, `log2` |
| Other         | `exp`, `abs`, `floor`, `ceil`, `round`   |

### Syntax rules

- Identifiers are case-sensitive: `pi` is valid, `PI` is not.
- Only the constants and functions listed above are recognized.
- Whitespace (spaces, tabs, newlines, and carriage returns) is ignored between tokens.
- Unknown characters and unknown identifiers raise a `LexError`.

## Project structure

```text
.
├── src/
│   ├── main.ts                  # CLI entry point (not implemented yet)
│   └── parser/
│       └── lexer/
│           ├── lexer.ts         # Lexer implementation and LexError
│           ├── lexer.types.ts   # Token and Position types
│           ├── utils.ts         # Character classification helpers
│           ├── lexer.test.ts    # Lexer tests
│           └── utils.test.ts    # Utility tests
├── bunfig.toml                  # Bun configuration (test timeout)
├── package.json
└── tsconfig.json
```

## Development

This project follows a red–green–refactor TDD workflow: write a failing test, implement the smallest change that makes it pass, then refactor.

Useful commands:

```bash
bun test                              # run every test
bun test --watch                      # re-run tests on change
bun test src/parser/lexer/lexer.test.ts  # run a single test file
bun run typecheck                     # type-check the project
```

## Roadmap

- [x] Lexer
- [ ] Parser (AST)
- [ ] Evaluator
- [ ] CLI (REPL and one-shot expressions)
- [ ] User-facing error formatting
