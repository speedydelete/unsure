
export class CodeStream {

    code: string = '';
    tokens: Token[] = [];
    pos: number = 0;
    line: number = 0;
    col: number = 0;
    raw: string = '';
    eaten: string = '';

    constructor(code?: string | Token[] | {code?: string, tokens?: Token[]}) {
        if (typeof code === 'string') {
            this.code = code;
        } else if (code instanceof Array) {
            this.tokens = code;
        } else if (typeof code === 'object' && code !== null) {
            this.code = code.code ?? '';
            this.tokens = code.tokens ?? [];
        }
    }

    handleMultiline(): void {
        if (this.raw.includes('\n')) {
            this.line = (this.raw.match(/\n/g) || []).length;
            this.col = this.raw.length - this.raw.lastIndexOf('\n');
        } else {
            this.col += this.raw.length;
        }
    }

    char(): string {
        return this.code[this.pos++];
    }

    chars(length: number): string {
        this.pos += length;
        return this.code.slice(this.pos - length, this.pos);
    }

    eat(text: string | string[], multiline: boolean = false): string | null {
        if (typeof text === 'string') {
            if (this.code.slice(this.pos, this.pos + text.length) === text) {
                this.raw = text;
                this.eaten = text;
                this.pos += text.length;
                if (multiline) {
                    this.handleMultiline();
                }
                return text;
            } else {
                return null;
            }
        } else {
            for (let subtext of text) {
                if (this.eat(subtext)!) {
                    return subtext;
                }
            }
            return null;
        }
    }

    match(regex: RegExp, multiline: boolean = false): RegExpMatchArray | null {
        let match = this.code.slice(this.pos).match(regex);
        if (match !== null) {
            this.raw = match[0];
            this.pos += match[0].length;
            this.col += match[0].length;
            if (multiline) {
                this.handleMultiline();
            }
        }
        return match;
    }

    done(): boolean {
        return this.pos === this.code.length;
    }

    token<T extends Token>(token: ReturnType<typeof createTokenFactory<T>>, ...args: T[keyof Omit<T, keyof BaseToken>][]): void {
        this.tokens.push(token(this.raw, this.line, this.col, ...args));
    }

}



export class SyntaxError_ extends Error {

    line: number;
    col: number;

    constructor(message: string, {line, col}: {line: number, col: number}) {
        super(message);
        this.line = line;
        this.col = col;
    }
}


export interface BaseToken {
    type: string;
    raw: string;
    line: number;
    col: number;
}

export function BaseToken(type: string, raw: string, line: number, col: number): BaseToken {
    return {type, raw, line, col};
}

type CreateTokenType<Type extends string, T extends {[key: string]: unknown} = {}> = BaseToken & {type: Type} & T;

function createTokenFactory<T extends BaseToken>(type: string, ...names: string[]): (raw: string, line: number, col: number, ...args: T[keyof Omit<T, keyof BaseToken>][]) => T {
    return function(raw: string, line: number, col: number, ...args: T[keyof Omit<T, keyof BaseToken>][]): T {
        // @ts-ignore // why
        return Object.assign(Token(type, raw, line, col), Object.fromEntries(names.map((name, i) => [name, args[i]])));
    }
}

export type Newline = CreateTokenType<'Newline'>;
export let Newline = createTokenFactory<Newline>('Newline');
export type Space = CreateTokenType<'Space'>;
export let Space = createTokenFactory<Newline>('Space');
export type Whitespace = Newline | Space;

export type Semicolon = CreateTokenType<'Semicolon'>;
export let Semicolon = createTokenFactory<Semicolon>('Semicolon');

export type LeftParen = CreateTokenType<'LeftParen'>;
export let LeftParen = createTokenFactory<LeftParen>('LeftParen');
export type RightParen = CreateTokenType<'RightParen'>;
export let RightParen = createTokenFactory<RightParen>('RightParen');

export type LeftBracket = CreateTokenType<'LeftBracket'>;
export let LeftBracket = createTokenFactory<LeftBracket>('LeftBracket');
export type RightBracket = CreateTokenType<'RightBracket'>;
export let RightBracket = createTokenFactory<RightBracket>('RightBracket');

export type LeftBrace = CreateTokenType<'LeftBrace'>;
export let LeftBrace = createTokenFactory<LeftBrace>('LeftBrace');
export type RightBrace = CreateTokenType<'RightBrace'>;
export let RightBrace = createTokenFactory<RightBrace>('RightBrace');

export type Period = CreateTokenType<'Period'>;
export let Period = createTokenFactory<Period>('Period');
export type Comma = CreateTokenType<'Comma'>;
export let Comma = createTokenFactory<Comma>('Comma');
export type Equals = CreateTokenType<'Equals'>;
export let Equals = createTokenFactory<Equals>('Equals');

export type StringLiteral = CreateTokenType<'StringLiteral', {value: string}>;
export let StringLiteral = createTokenFactory<StringLiteral>('StringLiteral', 'value');
export type NumberLiteral = CreateTokenType<'NumberLiteral', {value: string, flags: string}>;
export let NumberLiteral = createTokenFactory<NumberLiteral>('NumberLiteral', 'value', 'flags');

export type Keyword<T extends typeof KEYWORDS[number] = typeof KEYWORDS[number]> = CreateTokenType<'Keyword', {name: string}>;
export let Keyword = createTokenFactory<Keyword>('Keyword', 'name');

export type Operator = CreateTokenType<'Operator', {op: string}>;
export let Operator = createTokenFactory<Operator>('Operator', 'op');

export type Identifier = CreateTokenType<'Identifier', {name: string}>;
export let Identifier = createTokenFactory<Identifier>('Identifier', 'name');

export type Token = Whitespace | Semicolon | LeftParen | RightParen | LeftBracket | RightBracket | LeftBrace | RightBrace | Period | Comma | Equals | StringLiteral | NumberLiteral | Keyword | Operator | Identifier;


const ESCAPE_CODES: {[key: string]: string} = {
    a: '\a',
    b: '\b',
    e: '\x1b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
    v: '\v',
};

function extractString(code: CodeStream, endsWith: string): string {
    let esc = false;
    let out = '';
    while (!code.eat(endsWith)) {
        if (esc) {
            let char = code.char();
            if (char in ESCAPE_CODES) {
                out += ESCAPE_CODES[char];
            } else if (char === 'x') {
                out += String.fromCharCode(parseInt(code.chars(2), 16));
            } else if (char === 'u') {
                out += String.fromCharCode(parseInt(code.chars(4), 16));
            } else if (char === 'U') {
                out += String.fromCharCode(parseInt(code.chars(8), 16));
            } else if (char === '0' || char === '1' || char === '2' || char === '3' || char === '4' || char === '5' || char === '6' || char === '7') {
                out += String.fromCharCode(parseInt(code.chars(3), 8));
            } else {
                out += char;
            }
        } else if (code.eat('\\')) {
            esc = true;
        } else {
            out += code.char();
        }
    }
    return out;
}


const KEYWORDS = ['let', 'const', 'if', 'else', 'for', 'while', 'return', 'def', 'in', 'typeof', 'extends', 'instanceof', 'subclassof', 'type', 'interface', 'use', 'class', 'break', 'continue', 'async', 'await', 'yield', 'switch', 'case', 'throw', 'try', 'catch', 'finally', 'enum', 'super', 'abstract'];

const OPERATORS = ['++', '--', '&&', '||', '^^', '==', '!=', '<=', '>=', '**', '+', '-', '*', '/', '%', '&', '|', '^', '!', '~', '<', '>', '?', ':'];

export function tokenize(code: string | CodeStream): Token[] {
    if (typeof code === 'string') {
        code = new CodeStream(code);
    }
    let match: RegExpMatchArray | null;
    let text: string | null;
    while (!code.done()) {
        if (code.eat(' ')) {
            code.token(Space);
        } else if (code.eat('\n', true)) {
            code.token(Newline);
        } else if (match = code.match(/[a-zA-Z_$][a-zA-Z0-9_$]*/)) {
            if (KEYWORDS.includes(match[0])) {
                code.token(Keyword, match[0])
            } else {
                code.token(Identifier, match[0]);
            }
        } else if (code.eat('.')) {
            code.token(Period);
        } else if (code.eat(',')) {
            code.token(Comma);
        } else if (code.eat(';')) {
            code.token(Semicolon);
        } else if (code.eat('(')) {
            code.token(LeftParen);
        } else if (code.eat(')')) {
            code.token(RightParen);
        } else if (code.eat('{')) {
            code.token(LeftBrace);
        } else if (code.eat('}')) {
            code.token(RightBrace);
        } else if (code.eat('=')) {
            code.token(Equals);
        } else if (code.eat('[')) {
            code.token(LeftBracket);
        } else if (code.eat(']')) {
            code.token(RightBracket);
        } else if (text = code.eat(OPERATORS)) {
            code.token(Operator, text);
        } else if (code.eat("'")) {
            code.token(StringLiteral, extractString(code, "'"));
        } else if (code.eat('"')) {
            code.token(StringLiteral, extractString(code, '"'));
        } else if (match = code.match(/((-?[1-9][0-9]*(\.[0-9]+)?|0b[01]+|0o[0-7]+|0x[0-9A-Fa-f]+))([nfd]|u?[bsil])?/)) {
            code.token(NumberLiteral, match[1], match[2]);
        } else {
            throw new SyntaxError_('cannot find token', code);
        }
    }
    return code.tokens;
}
