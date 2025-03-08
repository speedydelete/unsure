
import * as t from './tokenizer';
import {SyntaxError_} from './tokenizer';


export type TokenList<T extends t.Token = t.Token> = [T, ...t.Token[]];


export interface BaseAST {
    ast: true;
    type: string;
    raw: string;
    line: number;
    col: number;
}

export function BaseAST(type: string, raw: string, line: number, col: number): BaseAST {
    return {ast: true, type, raw, line, col};
}

type CreateASTType<Type extends string, T extends {[key: string]: unknown} = {}> = BaseAST & {type: Type} & T;

function createASTFactory<T extends BaseAST>(type: string, ...names: (keyof Omit<T, keyof BaseAST>)[]): (raw: string, line: number, col: number, ...args: T[keyof Omit<T, keyof BaseAST>][]) => T {
    return function(raw: string, line: number, col: number, ...args: T[keyof Omit<T, keyof BaseAST>][]): T {
        // @ts-ignore // why
        return Object.assign(BaseAST(type, raw, line, col), Object.fromEntries(names.map((name, i) => [name, args[i]])));
    }
}

export type StringLiteral = CreateASTType<'StringLiteral', {value: string}>;
export let StringLiteral = createASTFactory<StringLiteral>('StringLiteral', 'value');

export type ByteLiteral = CreateASTType<'ByteLiteral', {value: number}>;
export let ByteLiteral = createASTFactory<ByteLiteral>('ByteLiteral', 'value');
export type ShortLiteral = CreateASTType<'ShortLiteral', {value: number}>;
export let ShortLiteral = createASTFactory<ShortLiteral>('ShortLiteral', 'value');
export type IntLiteral = CreateASTType<'IntLiteral', {value: number}>;
export let IntLiteral = createASTFactory<IntLiteral>('IntLiteral', 'value');
export type LongLiteral = CreateASTType<'LongLiteral', {value: bigint}>;
export let LongLiteral = createASTFactory<LongLiteral>('LongLiteral', 'value');
export type BigintLiteral = CreateASTType<'BigintLiteral', {value: bigint}>;
export let BigintLiteral = createASTFactory<BigintLiteral>('BigintLiteral', 'value');
export type FloatLiteral = CreateASTType<'FloatLiteral', {value: number}>;
export let FloatLiteral = createASTFactory<FloatLiteral>('FloatLiteral', 'value');
export type DoubleLiteral = CreateASTType<'DoubleLiteral', {value: number}>;
export let DoubleLiteral = createASTFactory<DoubleLiteral>('DoubleLiteral', 'value');
export type NumberLiteral = ByteLiteral | ShortLiteral | IntLiteral | LongLiteral | BigintLiteral | FloatLiteral | DoubleLiteral;

export type Identifier = CreateASTType<'Identifier', {name: string}>;
export let Identifier = createASTFactory<Identifier>('Identifier', 'name');

export type UnaryOp = CreateASTType<'UnaryOp', {op: '+' | '-' | '++' | '--' | '!' | '~' | 'typeof', value: Expression}>;
export let UnaryOp = createASTFactory<UnaryOp>('UnaryOp', 'op', 'value');
export type BinaryOp = CreateASTType<'BinaryOp', {op: t.OperatorString, left: Expression, right: Expression}>;
export let BinaryOp = createASTFactory<BinaryOp>('BinaryOp', 'op', 'left', 'right');
export type TernaryConditional = CreateASTType<'TernaryConditional', {test: Expression, left: Expression, right: Expression}>;
export let TernaryConditional = createASTFactory<TernaryConditional>('BinaryOp', 'test', 'left', 'right');

export type Argument = CreateASTType<'Argument', {name: Identifier, type_: Expression | null, value: Expression | null}>;
export let Argument = createASTFactory<Argument>('Argument', 'name', 'type_', 'value');

export type PropertyAccess = CreateASTType<'PropertyAccess', {obj: Expression, prop: Identifier}>;
export let PropertyAccess = createASTFactory<PropertyAccess>('PropertyAccess', 'obj', 'prop');
export type FunctionCall = CreateASTType<'FunctionCall', {func: Expression, args: Argument[]}>;
export let FunctionCall = createASTFactory<FunctionCall>('FunctionCall', 'func', 'args');
export type GetItem = CreateASTType<'GetItem', {obj: Expression, index: Expression}>;
export let GetItem = createASTFactory<GetItem>('GetItem', 'obj', 'index');
export type GetSlice = CreateASTType<'GetSlice', {obj: Expression, start: Expression, stop: Expression}>;
export let GetSlice = createASTFactory<GetSlice>('GetSlice', 'obj', 'start', 'stop');

export type Generic = CreateASTType<'Generic', {obj: Expression, generic: Expression[]}>;
export let Generic = createASTFactory<Generic>('Generic', 'obj', 'generic');

export type Expression = StringLiteral | NumberLiteral | Identifier | UnaryOp | BinaryOp | TernaryConditional | PropertyAccess | FunctionCall | GetItem | GetSlice | Generic;

export type Assignment = CreateASTType<'Assignment', {const: boolean, id: Identifier | GetItem, value: Expression}>;
export let Assignment = createASTFactory<Assignment>('Assignment', 'const', 'id', 'value');
export type TypedAssignment = CreateASTType<'TypedAssignment', {type_: Expression, const: boolean, id: Identifier | GetItem, value: Expression}>;
export let TypedAssignment = createASTFactory<TypedAssignment>('TypedAssignment', 'type_', 'const', 'id', 'value');

export type IfStatement = CreateASTType<'IfStatement', {test: Expression, body: Statement[], orelse: Statement[]}>;
export let IfStatement = createASTFactory<IfStatement>('IfStatement', 'test', 'body', 'orelse');
export type ForLoop = CreateASTType<'ForLoop', {initial: Expression, test: Expression, loop: Expression, body: Statement[]}>;
export let ForLoop = createASTFactory<ForLoop>('ForLoop', 'initial', 'test', 'loop', 'body');
export type WhileLoop = CreateASTType<'WhileLoop', {test: Expression, body: Statement[]}>;
export let WhileLoop = createASTFactory<WhileLoop>('WhileLoop', 'test', 'body');

export type FunctionDefinition = CreateASTType<'FunctionDefinition', {name: Identifier, arguments: Argument[], body: Statement[], orelse: Statement[]}>;
export let FunctionDefinition = createASTFactory<FunctionDefinition>('FunctionDefinition', 'name', 'arguments', 'body');

export type ClassDefinition = CreateASTType<'ClassDefinition', {name: Identifier, superclasses: Expression[], body: Statement[]}>;
export let ClassDefinition = createASTFactory<ClassDefinition>('ClassDefinition', 'name', 'superclasses', 'body');

export type Statement = Assignment | TypedAssignment | IfStatement | ForLoop | WhileLoop | FunctionDefinition | ClassDefinition;

export type Program = CreateASTType<'Program', {statements: Statement[]}>;
export let Program = createASTFactory<Program>('Program', 'statements');

export type AST = Program | Statement;


export function createNode<T extends typeof StringLiteral | typeof ByteLiteral | typeof ShortLiteral | typeof IntLiteral | typeof LongLiteral | typeof BigintLiteral | typeof FloatLiteral | typeof DoubleLiteral | typeof Identifier | typeof UnaryOp | typeof BinaryOp | typeof TernaryConditional | typeof Argument | typeof PropertyAccess | typeof FunctionCall | typeof GetItem | typeof GetSlice | typeof Generic | typeof Assignment | typeof TypedAssignment | typeof IfStatement | typeof ForLoop | typeof WhileLoop | typeof FunctionDefinition | typeof ClassDefinition | typeof Program>(node: T, token: t.Token | t.Token[], ...args: T extends (raw: string, line: number, col: number, ...args: infer U) => ReturnType<T> ? U : never): ReturnType<T> {
    if (token instanceof Array) {
        // @ts-ignore // why doesn't this work
        return node(token.map(x => x.raw).join(' '), token[0].line, token[0].col, ...args);
    } else {
        // @ts-ignore // why doesn't this work
        return node(token.raw, token.line, token.col, ...args);
    }
}

export function parseCall(tokens: t.Token[]): FunctionCall {
    throw new TypeError('function calls are not supported');
}

export const PRECEDENCE: {[key: string]: number} = {
    '**': 8,
    '*': 7,
    '/': 7,
    '%': 7,
    '+': 6,
    '-': 6,
    '&': 5,
    '|': 5,
    '^': 5,
    'extends': 3,
    'instanceof': 3,
    'subclassof': 3,
    '==': 2,
    '!=': 2,
    '<': 2,
    '<=': 2,
    '>': 2,
    '>=': 2,
    '&&': 1,
    '||': 1,
    '^^': 1,
};

export function parseSimpleExpression(tokens: (t.Token | Expression)[]): Expression {
    let out: (t.Token | Expression)[] = [];
    let ops: t.Operator[] = [];
    for (let token of tokens) {
        if (token.ast) {
            out.push(token);
        }
        if (token.type === 'Keyword' && (token.name === 'extends' || token.name === 'instanceof' || token.name === 'subclassof')) {
            token = t.Operator(token.raw, token.line, token.col, token.name);
        }
        if (token.type === 'Operator') {
            while (ops.length > 0 && PRECEDENCE[token.op] > PRECEDENCE[ops[0].op]) {
                out.push(ops.pop() as t.Operator);
            }
            ops.push(token);
        } else {
            out.push(token);
        }
    }
    let left: Expression | null = null;
    let right: Expression | null = null;
    for (let token of out) {
        if (token.type === 'Operator') {
            if (left === null || right === null) {
                throw new SyntaxError_('invalid expression', token);
            }
            left = createNode(BinaryOp, token, token.op, left, right);
            continue;
        }
        let expr: Expression;
        if (token.ast) {
            expr = token;
        } else if (token.type === 'Identifier') {
            expr = createNode(Identifier, token, token.name);
        } else if (token.type === 'StringLiteral') {
            expr = createNode(StringLiteral, token, token.value);
        } else if (token.type === 'NumberLiteral') {
            let value = token.value;
            if (value.includes('.')) {
                if (value.endsWith('f')) {
                    expr = createNode(FloatLiteral, token, parseFloat(value));
                } else {
                    expr = createNode(DoubleLiteral, token, parseFloat(value));
                }
            } else {
                if (value.endsWith('b')) {
                    expr = createNode(ByteLiteral, token, parseInt(value));
                } else if (value.endsWith('s')) {
                    expr = createNode(ShortLiteral, token, parseInt(value));
                } else if (value.endsWith('i')) {
                    expr = createNode(IntLiteral, token, parseInt(value));
                } else if (value.endsWith('l')) {
                    expr = createNode(LongLiteral, token, BigInt(value));
                } else {
                    expr = createNode(BigintLiteral, token, BigInt(value));
                }
            }
        } else {
            throw new SyntaxError_(`invalid token in expression: ${token.type}`, token);
        }
        if (left === null) {
            left = expr;
        } else if (right === null) {
            right = expr;
        } else {
            throw new SyntaxError_('invalid syntax', expr);
        }
    }
    if (left === null) {
        throw new SyntaxError_('empty expression', tokens[0]);
    }
    return left;
}

export function parseExpression(tokens: t.Token[], startIndex: number = 0, endAtParen: boolean = false): [Expression, number] {
    let wasIdentifier = false;
    let out: (t.Token | Expression)[] = [];
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (token.type === 'LeftParen') {
            if (wasIdentifier) {
                wasIdentifier = false;
            } else {
                let [expr, len] = parseExpression(tokens, i, true);
                out.push(expr);
                i = len - 1;
            }
        } else if (token.type === 'RightParen') {
            if (endAtParen) {
                return [parseSimpleExpression(out), i];
            } else {
                throw new SyntaxError_('mismatched parentheses', token);
            }
        } else {
            out.push(token);
            if (token.type === 'Identifier') {
                wasIdentifier = true;
            } else {
                wasIdentifier = false;
            }
        }
    }
    return [parseSimpleExpression(out), tokens.length];
}

export function parseTypedAssignment(tokens: TokenList<t.Identifier>, const_: boolean): TypedAssignment {
    if (tokens[1].type !== 'Identifier') {
        throw new SyntaxError_('expected identifier', tokens[1]);
    }
    let [expr, len] = parseExpression(tokens, 2);
    if (len !== tokens.length) {
        throw new SyntaxError_('expected semicolon', tokens[len]);
    }
    return createNode(TypedAssignment, tokens, createNode(Identifier, tokens[0], tokens[0].name), const_, createNode(Identifier, tokens[1], tokens[1].name), expr);
}

export function parseAssignment(tokens: TokenList<t.Keyword<'let' | 'const'> | t.Identifier>): Assignment | TypedAssignment {
    if (tokens[0].type === 'Keyword') {
        if (tokens[1].type !== 'Identifier') {
            throw new SyntaxError_('expected identifier', tokens[1]);
        }
        if (tokens[2].type === 'Equals') {
            let [expr, len] = parseExpression(tokens, 3);
            if (len !== tokens.length) {
                throw new SyntaxError_('expected semicolon', tokens[len]);
            }
            return createNode(Assignment, tokens, tokens[0].name === 'const', createNode(Identifier, tokens[1], tokens[1].name), expr);
        } else if (tokens[2].type === 'Identifier') {
            return parseTypedAssignment(tokens.slice(1) as TokenList<t.Identifier>, tokens[0].name === 'const');
        } else {
            throw new SyntaxError_('expected equals sign or identifier', tokens[2]);
        }
    } else {
        return parseTypedAssignment(tokens as TokenList<t.Identifier>, false);
    }
}

export function parseStatement(tokens: t.Token[]): Statement {
    if (tokens[0].type === 'Keyword') {
        let keyword = tokens[0].name;
        if (keyword === 'if') {
            if (tokens[1].type !== 'LeftParen') {
                throw new SyntaxError_('expected expression after if keyword', tokens[1]);
            }
            let [test, len] = parseExpression(tokens, 2, true);
            if (tokens[len].type !== 'LeftBrace') {
                throw new SyntaxError_('expected block after if keyword', tokens[len]);
            }
            let [body, len2] = parseCodeBlock(tokens, len + 1);
            if (tokens[len2].type === 'Keyword' && tokens[len2].name === 'else') {
                if (tokens[len2 + 1].type !== 'LeftBrace') {
                    throw new SyntaxError_('expected block after else keyword', tokens[len2 + 1]);
                }
                let [orelse, len3] = parseCodeBlock(tokens, len + 1)
                if (len3 !== tokens.length) {
                    throw new SyntaxError_('expected semicolon', tokens[len3]);
                }
                return createNode(IfStatement, tokens, test, body, orelse);
            } else {
                return createNode(IfStatement, tokens, test, body, []);
            }
        } else if (keyword === 'let' || keyword === 'const') {
            return parseAssignment(tokens as TokenList<t.Keyword<'let' | 'const'>>);
        } else {
            throw new SyntaxError_(`${keyword} does not have an assigned meaning`, tokens[0]);
        }
    } else if (tokens[0].type === 'Identifier') {
        return parseAssignment(tokens as TokenList<t.Identifier>);
    } else {
        throw new SyntaxError_(`invalid token for the start of a statement: ${tokens[0].type}`, tokens[0]);
    }
}

export function parseCodeBlock(tokens: t.Token[], startIndex: number = 0, endAtBrace: boolean = true): [Statement[], number] {
    let out: Statement[] = [];
    let braceCount = 0;
    let buffer: t.Token[] = [];
    for (let i = startIndex; i < tokens.length; i++) {
        let token = tokens[i];
        if (token.type === 'Semicolon' && braceCount === 0) {
            out.push(parseStatement(tokens));
            buffer = [];
        } else {
            buffer.push(token);
            if (token.type === 'LeftBrace' || token.type === 'LeftParen') {
                braceCount++;
            } else if (token.type === 'RightBrace' || token.type === 'RightParen') {
                braceCount--;
                if (braceCount < 0) {
                    if (endAtBrace) {
                        return [out, i];
                    } else {
                        throw new SyntaxError_('mismatched parentheses and/or braces', token);
                   }
                }
            }
        }
    }
    return [out, tokens.length];
}

export function createASTFromTokens(tokens: t.Token[]): Program {
    return createNode(Program, tokens, parseCodeBlock(tokens)[0]);
}


export function parse(code: string): Program {
    return createASTFromTokens(t.tokenize(code));
}
