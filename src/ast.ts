
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

export type Identifier = CreateASTType<'Identifier', {name: string}>;
export let Identifier = createASTFactory<Identifier>('Identifier', 'name');

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

export type UnaryOp = CreateASTType<'UnaryOp', {op: '+' | '-' | '++' | '--' | '!' | '~' | 'typeof', value: Expression}>;
export let UnaryOp = createASTFactory<UnaryOp>('UnaryOp', 'op', 'value');
export type BinaryOp = CreateASTType<'BinaryOp', {op: t.OperatorString, left: Expression, right: Expression}>;
export let BinaryOp = createASTFactory<BinaryOp>('BinaryOp', 'op', 'left', 'right');
export type TernaryConditional = CreateASTType<'TernaryConditional', {test: Expression, if_true: Expression, if_false: Expression}>;
export let TernaryConditional = createASTFactory<TernaryConditional>('BinaryOp', 'test', 'if_true', 'if_false');

export type Argument = CreateASTType<'Argument', {name: Identifier | null, type_: Expression | null, value: Expression | null}>;
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

export type Expression = Identifier | StringLiteral | NumberLiteral | UnaryOp | BinaryOp | TernaryConditional | PropertyAccess | FunctionCall | GetItem | GetSlice | Generic;
export type ExpressionStatement = CreateASTType<'ExpressionStatement', {expr: Expression}>;
export let ExpressionStatement = createASTFactory<ExpressionStatement>('ExpressionStatement', 'expr');

export type Assignment = CreateASTType<'Assignment', {declare: boolean, const: boolean, id: Identifier | GetItem, value: Expression}>;
export let Assignment = createASTFactory<Assignment>('Assignment', 'declare', 'const', 'id', 'value');
export type TypedAssignment = CreateASTType<'TypedAssignment', {type_: Expression, const: boolean, id: Identifier | GetItem, value: Expression}>;
export let TypedAssignment = createASTFactory<TypedAssignment>('TypedAssignment', 'type_', 'const', 'id', 'value');

export type IfStatement = CreateASTType<'IfStatement', {test: Expression, body: Statement[], orelse: Statement[]}>;
export let IfStatement = createASTFactory<IfStatement>('IfStatement', 'test', 'body', 'orelse');
export type ForLoop = CreateASTType<'ForLoop', {initial: Statement, test: Expression, loop: Statement, body: Statement[]}>;
export let ForLoop = createASTFactory<ForLoop>('ForLoop', 'initial', 'test', 'loop', 'body');
export type WhileLoop = CreateASTType<'WhileLoop', {test: Expression, body: Statement[]}>;
export let WhileLoop = createASTFactory<WhileLoop>('WhileLoop', 'test', 'body');

export type FunctionDefinition = CreateASTType<'FunctionDefinition', {name: Identifier, arguments: Argument[], body: Statement[], orelse: Statement[]}>;
export let FunctionDefinition = createASTFactory<FunctionDefinition>('FunctionDefinition', 'name', 'arguments', 'body');

export type ClassDefinition = CreateASTType<'ClassDefinition', {name: Identifier, superclasses: Expression[], body: Statement[]}>;
export let ClassDefinition = createASTFactory<ClassDefinition>('ClassDefinition', 'name', 'superclasses', 'body');

export type Statement = ExpressionStatement | Assignment | TypedAssignment | IfStatement | ForLoop | WhileLoop | FunctionDefinition | ClassDefinition;

export type Program = CreateASTType<'Program', {statements: Statement[]}>;
export let Program = createASTFactory<Program>('Program', 'statements');

export type AST = Program | Statement;
export type Node = AST | Expression | Argument;


interface  HasRawLineAndCol{
    raw: string;
    line: number;
    col: number;
}

export function createNode<T extends typeof Identifier | typeof StringLiteral | typeof ByteLiteral | typeof ShortLiteral | typeof IntLiteral | typeof LongLiteral | typeof BigintLiteral | typeof FloatLiteral | typeof DoubleLiteral | typeof UnaryOp | typeof BinaryOp | typeof TernaryConditional | typeof Argument | typeof PropertyAccess | typeof FunctionCall | typeof GetItem | typeof GetSlice | typeof Generic | typeof ExpressionStatement | typeof Assignment | typeof TypedAssignment | typeof IfStatement | typeof ForLoop | typeof WhileLoop | typeof FunctionDefinition | typeof ClassDefinition | typeof Program>(node: T, token: HasRawLineAndCol | HasRawLineAndCol[], ...args: T extends (raw: string, line: number, col: number, ...args: infer U) => ReturnType<T> ? U : never): ReturnType<T> {
    if (token instanceof Array) {
        // @ts-ignore // why doesn't this work
        return node(token.map(x => x.raw).join(''), token[0].line, token[0].col, ...args);
    } else {
        // @ts-ignore // why doesn't this work
        return node(token.raw, token.line, token.col, ...args);
    }
}

export function parseCall(tokens: t.Token[]): FunctionCall {
    throw new TypeError('function calls are not supported');
}


function tokenToExpression(token: t.Token | Expression): Expression | null {
    if (token.ast) {
        return token;
    } else if (token.type === 'Identifier') {
        return createNode(Identifier, token, token.name);
    } else if (token.type === 'StringLiteral') {
        return createNode(StringLiteral, token, token.value);
    } else if (token.type === 'NumberLiteral') {
        let value = token.value;
        if (value.includes('.')) {
            if (value.endsWith('f')) {
                return createNode(FloatLiteral, token, parseFloat(value));
            } else {
                return createNode(DoubleLiteral, token, parseFloat(value));
            }
        } else {
            if (value.endsWith('b')) {
                return createNode(ByteLiteral, token, parseInt(value));
            } else if (value.endsWith('s')) {
                return createNode(ShortLiteral, token, parseInt(value));
            } else if (value.endsWith('i')) {
                return createNode(IntLiteral, token, parseInt(value));
            } else if (value.endsWith('l')) {
                return createNode(LongLiteral, token, BigInt(value));
            } else {
                return createNode(BigintLiteral, token, BigInt(value));
            }
        }
    } else {
        return null;
    }
}

function tokenToExpressionWithError(token: t.Token | Expression): Expression {
    let out = tokenToExpression(token);
    if (out === null) {
        throw new SyntaxError_('invalid syntax', token);
    }
    return out;
}


function parseArgument(tokens: (t.Token | Expression)[]): Argument {
    if (tokens[0].ast) {
        return createNode(Argument, tokens[0], null, null, tokens[0]);
    }
    // placeholder, todo: make this better
    return createNode(Argument, tokens[0], null, null, parseExpression(tokens)[0]);
}

function parseSimpleExpressionReplaceCalls(tokens: (t.Token | Expression)[]): (t.Token | Expression)[] {
    let inFunction = false;
    let out: (t.Token | Expression)[] = [];
    let func: t.Token | Expression | null = null;
    let args: Argument[] = [];
    let argBuffer: (t.Token | Expression)[] = [];
    for (let token of tokens) {
        if (!inFunction) {
            if (token.type === 'LeftParen') {
                inFunction = true;
                let funcOrUndefined = out.pop();
                if (funcOrUndefined === undefined) {
                    throw new TypeError('this error should not occur');
                }
                func = funcOrUndefined;
            } else {
                out.push(token);
            }
        } else {
            if (token.type === 'RightParen') {
                args.push(parseArgument(argBuffer));
                argBuffer = [];
                inFunction = false;
                if (func === null) {
                    throw new TypeError('this error should not occur');
                }
                let funcExpr = tokenToExpression(func);
                if (funcExpr === null) {
                    throw new SyntaxError_(`unrecognized token of type: ${token.type}`, token);
                }
                out.push(createNode(FunctionCall, token, funcExpr, args));
            } else if (token.type === 'Comma') {
                args.push(parseArgument(argBuffer));
                argBuffer = [];
            } else {
                argBuffer.push(token);
            }
        }
    }
    return out;
}

function parseSimpleExpressionHandleUnary(tokens: (t.Token | Expression)[]): (t.Token | Expression)[] {
    let out: (t.Token | Expression)[] = [];
    let wasOperator = true;
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        if (token.type === 'Operator') {
            if (wasOperator) {
                i++;
                if (!(token.op === '+' || token.op === '-' || token.op === '++' || token.op === '--' || token.op === '!' || token.op === '~' || token.op === 'typeof')) {
                    throw new SyntaxError_(`${token.op} is not unary`, token);
                }
                out.push(createNode(UnaryOp, [token, tokens[i]], token.op, tokenToExpressionWithError(tokens[i])));
            } else if (!wasOperator && (token.op === '++' || token.op === '--')) {
                out[out.length - 1] = createNode(UnaryOp, [out[out.length - 1], token], token.op, tokenToExpressionWithError(out[out.length - 1]));
            } else {
                out.push(token);
            }
            wasOperator = true;
        } else {
            out.push(token);
            wasOperator = false;
        }
    }
    return out;
}

const PRECEDENCE: {[key: string]: number} = {
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

function parseSimpleExpression(tokens: (t.Token | Expression)[]): Expression {
    tokens = parseSimpleExpressionReplaceCalls(tokens);
    tokens = parseSimpleExpressionHandleUnary(tokens);
    let out: (Expression | t.Operator)[] = [];
    let ops: t.Operator[] = [];
    for (let token of tokens) {
        let expr = tokenToExpression(token);
        if (expr !== null) {
            out.push(expr);
        } else if (token.type === 'Keyword' && (token.name === 'extends' || token.name === 'instanceof' || token.name === 'subclassof')) {
            token = t.Operator(token.raw, token.line, token.col, token.name);
        } else if (token.type === 'Operator') {
            while (ops.length > 0 && PRECEDENCE[token.op] > PRECEDENCE[ops[0].op]) {
                out.push(ops.pop() as t.Operator);
            }
            ops.push(token);
        } else {
            throw new SyntaxError_(`unsupported token of type ${token.type}`, token);
        }
    }
    while (ops.length > 0) {
        out.push(ops.pop() as t.Operator);
    }
    let left: Expression | null = null;
    let right: Expression | null = null;
    for (let token of out) {
        if (token.type === 'Operator') {
            if (left === null || right === null) {
                throw new SyntaxError_('invalid expression', token);
            }
            left = createNode(BinaryOp, [left, token, right], token.op, left, right);
            continue;
        }
        if (left === null) {
            left = token;
        } else if (right === null) {
            right = token;
        } else {
            throw new SyntaxError_('invalid syntax', token);
        }
    }
    if (left === null) {
        throw new SyntaxError_('empty expression', tokens[0]);
    }
    return left;
}

function parseExpression(tokens: (t.Token | Expression)[], startIndex: number = 0, endAtParen: boolean = false): [Expression, number] {
    let wasIdentifier = false;
    let out: (t.Token | Expression)[] = [];
    let inFunction = false;
    for (let i = startIndex; i < tokens.length; i++) {
        let token = tokens[i];
        if (token.type === 'LeftParen') {
            if (wasIdentifier) {
                wasIdentifier = false;
                out.push(token);
                inFunction = true;
            } else {
                let [expr, len] = parseExpression(tokens, i, true);
                out.push(expr);
                i = len - 1;
            }
        } else if (token.type === 'RightParen') {
            if (inFunction) {
                out.push(token);
                inFunction = false;
            } else if (endAtParen) {
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

function parseTypedAssignment(tokens: TokenList<t.Identifier>, const_: boolean): Assignment | TypedAssignment {
    if (tokens[1].type === 'Identifier') {
        if (tokens[2].type !== 'Equals') {
            throw new SyntaxError_('expected equals sign', tokens[2]);
        }
        let [expr, len] = parseExpression(tokens, 3);
        if (len !== tokens.length) {
            throw new SyntaxError_('expected semicolon', tokens[len]);
        }
        return createNode(TypedAssignment, tokens, createNode(Identifier, tokens[0], tokens[0].name), const_, createNode(Identifier, tokens[1], tokens[1].name), expr);
    } else if (tokens[1].type === 'Equals') {
        let [expr, len] = parseExpression(tokens, 2);
        if (len !== tokens.length) {
            throw new SyntaxError_('expected semicolon', tokens[len]);
        }
        return createNode(Assignment, tokens, false, false, createNode(Identifier, tokens[0], tokens[0].name), expr);
    } else {
        throw new SyntaxError_('expected identifier or equals sign', tokens[1]);
    }
}

function parseAssignment(tokens: TokenList<t.Keyword<'let' | 'const'> | t.Identifier>): Assignment | TypedAssignment {
    if (tokens[0].type === 'Keyword') {
        if (tokens[1].type !== 'Identifier') {
            throw new SyntaxError_('expected identifier', tokens[1]);
        }
        if (tokens[2].type === 'Equals') {
            let [expr, len] = parseExpression(tokens, 3);
            if (len !== tokens.length) {
                throw new SyntaxError_('expected semicolon', tokens[len]);
            }
            return createNode(Assignment, tokens, true, tokens[0].name === 'const', createNode(Identifier, tokens[1], tokens[1].name), expr);
        } else if (tokens[2].type === 'Identifier') {
            return parseTypedAssignment(tokens.slice(1) as TokenList<t.Identifier>, tokens[0].name === 'const');
        } else {
            throw new SyntaxError_('expected equals sign or identifier', tokens[2]);
        }
    } else {
        return parseTypedAssignment(tokens as TokenList<t.Identifier>, false);
    }
}

function extractForLoopExpressions(tokens: t.Token[], startIndex: number = 0): [Statement, Expression, Statement, number] {
    let parenCount = 0;
    let out: (Expression | Statement)[] = [];
    let buffer: t.Token[] = [];
    for (let i = startIndex; i < tokens.length; i++) {
        let token = tokens[i];
        if (token.type === 'Space' || token.type === 'Newline') {
            continue;
        } else if (token.type === 'Semicolon' && parenCount === 0) {
            out.push(out.length === 1 ? parseExpression(buffer)[0] : parseStatement(buffer));
            buffer = [];
        } else {
            if (token.type === 'LeftParen') {
                parenCount++;
            } else if (token.type === 'RightParen') {
                parenCount--;
                if (parenCount < 0) {
                    out.push(parseStatement(buffer));
                    if (out.length !== 3 ) {
                        throw new SyntaxError_('for statement must be followed by 3 sections', tokens[0]);
                    }
                    return [out[0] as Statement, out[1] as Expression, out[2] as Statement, i];
                }
            }
            buffer.push(token);
        }
    }
    if (out.length !== 3) {
        throw new SyntaxError_('for statement must be followed by 3 sections', tokens[0]);
    }
    return [out[0] as Statement, out[1] as Expression, out[2] as Statement, tokens.length];
}

function parseStatement(tokens: t.Token[]): Statement {
    if (tokens[0].type === 'Keyword') {
        let keyword = tokens[0].name;
        if (keyword === 'let' || keyword === 'const') {
            return parseAssignment(tokens as TokenList<t.Keyword<'let' | 'const'>>);
        } else if (keyword === 'if') {
            if (tokens[1].type !== 'LeftParen') {
                throw new SyntaxError_('expected expression after if keyword', tokens[1]);
            }
            let [test, len] = parseExpression(tokens, 2, true);
            if (tokens[len + 1].type !== 'LeftBrace') {
                throw new SyntaxError_('expected block after if keyword', tokens[len]);
            }
            let [body, len2] = parseCodeBlock(tokens, len + 2);
            let token = tokens[len2 + 1];
            if (token !== undefined && token.type === 'Keyword' && token.name === 'else') {
                if (tokens[len2 + 2].type !== 'LeftBrace') {
                    throw new SyntaxError_('expected block after else keyword', token);
                }
                let [orelse, len3] = parseCodeBlock(tokens, len2 + 3);
                if (len3 !== tokens.length - 1) {
                    throw new SyntaxError_('expected semicolon', tokens[len3]);
                }
                return createNode(IfStatement, tokens, test, body, orelse);
            } else {
                return createNode(IfStatement, tokens, test, body, []);
            }
        } else if (keyword === 'for') {
            if (tokens[1].type !== 'LeftParen') {
                throw new SyntaxError_('expected expression after fir keyword', tokens[1]);
            }
            let [initial, test, loop, len] = extractForLoopExpressions(tokens, 2);
            if (tokens[len + 1].type !== 'LeftBrace') {
                throw new SyntaxError_('expected block after if keyword', tokens[len]);
            }
            let [body, len2] = parseCodeBlock(tokens, len + 2);
            if (len2 !== tokens.length - 1) {
                throw new SyntaxError_('expected semicolon', tokens[len2]);
            }
            return createNode(ForLoop, tokens, initial, test, loop, body);;
        } else {
            throw new SyntaxError_(`${keyword} does not have an assigned meaning`, tokens[0]);
        }
    } else if (tokens[0].type === 'Identifier') {
        try {
            return parseAssignment(tokens as TokenList<t.Identifier>);
        } catch (error) {
            if (error instanceof SyntaxError_) {
                try {
                    return createNode(ExpressionStatement, tokens[0], parseExpression(tokens)[0]);
                } catch (error2) {
                    if (error2 instanceof SyntaxError_) {
                        throw new SyntaxError_('cannot parse statement, tried parsing as assignment, got "' + error.message + '", tried parsing as expression, got "' + error2.message + '"', tokens[0]);
                    } else {
                        throw error2;
                    }
                }
            } else {
                throw error;
            }
        }
    } else {
        throw new SyntaxError_(`invalid token for the start of a statement: ${tokens[0].type}`, tokens[0]);
    }
}

function parseCodeBlock(tokens: t.Token[], startIndex: number = 0, endAtBrace: boolean = true): [Statement[], number] {
    let out: Statement[] = [];
    let parenCount = 0;
    let braceCount = 0;
    let buffer: t.Token[] = [];
    for (let i = startIndex; i < tokens.length; i++) {
        let token = tokens[i];
        if (token.type === 'Space' || token.type === 'Newline') {
            continue;
        } else if (token.type === 'Semicolon' && braceCount === 0 && parenCount === 0) {
            out.push(parseStatement(buffer));
            buffer = [];
        } else {
            buffer.push(token);
            if (token.type === 'LeftBrace') {
                braceCount++;
            } else if (token.type === 'LeftParen') {
                parenCount++;
            } else if (token.type === 'RightBrace') {
                braceCount--;
                if (braceCount === 0 && parenCount === 0) {
                    let j = 1;
                    let nextToken = tokens[i + j];
                    while (nextToken !== undefined && (nextToken.type === 'Space' || nextToken.type === 'Newline')) {
                        j++
                        nextToken = tokens[i + j];
                    }
                    if (!(nextToken !== undefined && nextToken.type === 'Keyword' && nextToken.name == 'else')) {
                        out.push(parseStatement(buffer));
                        buffer = [];
                    }
                }
                if (braceCount < 0) {
                    if (endAtBrace) {
                        return [out, i];
                    } else {
                        throw new SyntaxError_('mismatched braces', token);
                    }
                }
            } else if (token.type === 'RightParen') {
                parenCount--;
                if (parenCount < 0) {
                    throw new SyntaxError_('mismatched parentheses', token);
                }
            }
        }
    }
    return [out, tokens.length];
}

export function tokensToAST(tokens: t.Token[]): Program {
    return createNode(Program, tokens, parseCodeBlock(tokens, 0, false)[0]);
}


export function codeToAST(code: string): Program {
    return tokensToAST(t.tokenize(code));
}

export {codeToAST as parse};
