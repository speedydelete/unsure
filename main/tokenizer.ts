
export const KEYWORDS = ['use', 'let', 'const'];

const OPERATORS_LEN_2 = ['==', '!=', '>=', '<='];
const OPERATORS_LEN_1 = ['=', '>', '<', '+', '-', '*', '/', '%', '(', ')'];
export const OPERATORS = OPERATORS_LEN_1.concat(OPERATORS_LEN_2);

const ID_START_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
const ID_REGEX = /[a-zA-Z_][a-zA-Z_0-9]*/;

const INT_LITERAL_START_CHARS = '0123456789-';
const INT_LITERAL_REGEX = /-?[0-9]+/;

export type Keyword = typeof KEYWORDS[number];
export type Operator = typeof OPERATORS[number];

export type TokenType = 'Space' | 'Newline' | 'Keyword' | 'Operator' | 'IntLiteral' | 'Identifier';

export interface BaseToken {
    type: TokenType;
    raw: string;
    char: number;
}

export interface SpaceToken extends BaseToken {
    type: 'Space';
}

export interface NewlineToken extends BaseToken {
    type: 'Newline';
}

export interface KeywordToken extends BaseToken {
    type: 'Keyword';
    value: Keyword;
}

export interface OperatorToken extends BaseToken {
    type: 'Operator';
    op: Operator;
}

export interface IntLiteralToken extends BaseToken {
    type: 'IntLiteral';
    value: number;
}

export interface IdentifierToken extends BaseToken {
    type: 'Identifier';
    id: string;
}

export type Token = SpaceToken | NewlineToken | KeywordToken | OperatorToken | IntLiteralToken | IdentifierToken;

export function tokenize(code: string): Token[] {
    let out: Token[] = [];
    let line = 1;
    let i = 0;
    function addToken(type: TokenType, len: number, args: {[key: string]: any} = {}): void {
        // @ts-ignore
        out.push({
            type: type,
            raw: code.slice(i, i + len),
            char: i,
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
                const id = match[0];
                addToken('Identifier', id.length, {id: id});
            }
        } else if (OPERATORS_LEN_1.includes(char)) {
            if (OPERATORS_LEN_2.includes(code.slice(i, i + 2))) {
                addToken('Operator', 2, {op: code.slice(i, i + 2)});
            } else {
                addToken('Operator', 1, {op: char});
            }
        } else if (INT_LITERAL_START_CHARS.includes(char)) {
            const match = code.slice(i).match(INT_LITERAL_REGEX);
            if (match !== null) {
                const int = match[0];
                addToken('IntLiteral', int.length, {value: parseInt(int)});
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
                throw new SyntaxError(`unrecognized token on character ${code.length - i} (line ${line}), starting with "${code.slice(i, i + 10)}"`);
            }
        }
    }
    return out;
}
