
export const KEYWORDS = ['use', 'let', 'const'];
export type Keyword = typeof KEYWORDS[number];

export const SYMBOLS = ['(', ')', '++', '--', '*', '/'];

export const SYMBOL_TOKENS: Map<typeof SYMBOLS[number], TokenType> = new Map([
    ['(', 'LeftParen'],
    [')', 'RightParen'],
    ['++', 'IncOp'],
    ['--', 'DecOp'],
    ['*', 'MulOp'],
    ['/', 'DivOp'],
    ['+', 'AddOp'],
    ['-', 'SubOp'],
]);
export const TOKEN_SYMBOLS = new Map(Array.from(SYMBOL_TOKENS, a => a.reverse() as [string, string]));
TOKEN_SYMBOLS.set('MinusOp', '-');
TOKEN_SYMBOLS.set('PlusOp', '+');

export const WHITESPACE_TOKEN_TYPES = ['Space', 'Newline'];
export type WhitespaceTokenType = 'Space' | 'Newline';

export const LITERAL_TOKEN_TYPES = ['IntLiteral'];
export type LiteralTokenType = 'IntLiteral';

export const UNARY_OP_TOKEN_TYPES = ['IncOp', 'DecOp', 'MinusOp', 'PlusOp'];
export type UnaryOpTokenType = 'IncOp' | 'DecOp' | 'MinusOp' | 'PlusOp';

export const UNARY_OR_BIN_OP_TOKEN_TYPES = ['AddOp', 'SubOp'];
export type UnaryOrBinOpTokenType = 'AddOp' | 'SubOp';

export const BIN_OP_TOKEN_TYPES = ['MulOp', 'DivOp', 'AddOp', 'SubOp'];
export type BinOpTokenType = 'MulOp' | 'DivOp' | 'AddOp' | 'SubOp';

export const OP_TOKEN_TYPES = [...UNARY_OP_TOKEN_TYPES, ...BIN_OP_TOKEN_TYPES];
export type OpTokenType = UnaryOpTokenType | BinOpTokenType;

export const EXPR_TOKEN_TYPES = ['Identifier', ...LITERAL_TOKEN_TYPES, 'Keyword', 'LeftParen', 'RightParen', ...OP_TOKEN_TYPES];
export type ExprTokenType = 'Identifier' | LiteralTokenType | 'Keyword' | 'LeftParen' | 'RightParen' | OpTokenType;

export const TOKEN_TYPES = [...WHITESPACE_TOKEN_TYPES, ...EXPR_TOKEN_TYPES];
export type TokenType = WhitespaceTokenType | ExprTokenType;

export interface BaseToken {
    type: TokenType;
    raw: string;
    pos: number;
}

export interface SpaceToken extends BaseToken {
    type: 'Space';
}

export interface NewlineToken extends BaseToken {
    type: 'Newline';
}

export type WhitespaceToken = SpaceToken | NewlineToken;

export interface KeywordToken extends BaseToken {
    type: 'Keyword';
    value: Keyword;
}

export interface IdentifierToken extends BaseToken {
    type: 'Identifier';
    name: string;
}

export interface IntLiteralToken extends BaseToken {
    type: 'IntLiteral';
    value: BigInt;
}

export type LiteralToken = IntLiteralToken;

export interface LeftParenToken extends BaseToken {
    type: 'LeftParen';
}

export interface RightParenToken extends BaseToken {
    type: 'RightParen';
}

export interface UnaryOpToken extends BaseToken {
    type: UnaryOpTokenType;
}

export interface BinOpToken extends BaseToken {
    type: BinOpTokenType;
}

export type OpToken = UnaryOpToken | BinOpToken;

export type ExprToken = IdentifierToken | LiteralToken | LeftParenToken | RightParenToken | OpToken;

export type Token = WhitespaceToken | KeywordToken | ExprToken;


const ID_START_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
const ID_REGEX = /[a-zA-Z_][a-zA-Z_0-9]*/;

const INT_LITERAL_START_CHARS = '0123456789-';
const INT_LITERAL_REGEX = /-?[0-9]+/;

const SYMBOL_START_CHARS = SYMBOLS.map(x => x[0]);


export function tokenize(code: string): Token[] {
    let out: Token[] = [];
    let line = 1;
    let i = 0;
    function addToken(type: TokenType, len: number, args: {[key: string]: any} = {}): void {
        // @ts-ignore
        out.push({
            type: type,
            raw: code.slice(i, i + len),
            pos: i,
            ...args,
        });
        i += len;
    }
    while (i < code.length) {
        const char = code[i];
        if (char === ' ') {
            addToken('Space', 1);
        } else if (char === '\n') {
            addToken('Newline', 1);
            line += 1;
        } else if (ID_START_CHARS.includes(char)) {
            const match = code.slice(i).match(ID_REGEX);
            if (match !== null) {
                const name = match[0];
                addToken('Identifier', name.length, {name: name});
            }
        } else if (SYMBOL_START_CHARS.includes(char)) {
            const len2Token = SYMBOL_TOKENS.get(code.slice(i, i + 2));
            if (len2Token !== undefined) {
                addToken(len2Token, 2);
            } else {
                const token = SYMBOL_TOKENS.get(char);
                if (token !== undefined) {
                    addToken(token, 1);
                }
            }
        } else if (INT_LITERAL_START_CHARS.includes(char)) {
            const match = code.slice(i).match(INT_LITERAL_REGEX);
            if (match !== null) {
                const int = match[0];
                addToken('IntLiteral', int.length, {value: BigInt(int)});
            }
        } else {
            let found = false;
            for (const keyword of KEYWORDS) {
                if (code.startsWith(keyword)) {
                    addToken('Keyword', keyword.length, {value: keyword});
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw new SyntaxError(`unrecognized token at position ${code.length - i} (line ${line})`);
            }
        }
    }
    return out;
}
