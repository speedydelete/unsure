
export const KEYWORDS = ['use', 'let', 'const'];
export type Keyword = typeof KEYWORDS[number];

export type TokenType = 'Space' | 'Newline' | 'Keyword' | 'Identifier' | 'IntLiteral' | 'BinMul' | 'BinAdd' | 'BinSub';

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

export interface IdentifierToken extends BaseToken {
    type: 'Identifier';
    id: string;
}

export interface IntLiteralToken extends BaseToken {
    type: 'IntLiteral';
    value: number;
}

export interface BinOpToken extends BaseToken {
    type: 'BinMul' | 'BinAdd' | 'BinSub';
}

export type Token = SpaceToken | NewlineToken | KeywordToken | IdentifierToken | IntLiteralToken | BinOpToken;


const ID_START_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
const ID_REGEX = /[a-zA-Z_][a-zA-Z_0-9]*/;

const INT_LITERAL_START_CHARS = '0123456789-';
const INT_LITERAL_REGEX = /-?[0-9]+/;

const SYMBOLS = ['*', '+', '-'];
const SYMBOL_START_CHARS = SYMBOLS.map(x => x[0]);

const SYMBOL_TOKENS: Map<typeof SYMBOLS[number], TokenType> = new Map([
    ['*', 'BinMul'],
    ['+', 'BinAdd'],
    ['-', 'BinSub'],
]);


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
