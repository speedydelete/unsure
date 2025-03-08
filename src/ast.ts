
import * as t from './tokenizer';


export interface BaseAST {
    type: string;
    raw: string;
    line: number;
    col: number;
}

type CreateASTType<Type extends string, T extends {[key: string]: unknown} = {}> = BaseAST & {type: Type} & T;

function createASTFactory<T extends BaseAST>(type: string, ...names: (keyof Omit<T, keyof BaseAST>)[]): (raw: string, line: number, col: number, ...args: T[keyof Omit<T, keyof BaseAST>][]) => T {
    return function(raw: string, line: number, col: number, ...args: T[keyof Omit<T, keyof BaseAST>][]): T {
        // @ts-ignore // why
        return Object.assign(Token(type, raw, line, col), Object.fromEntries(names.map((name, i) => [name, args[i]])));
    }
}

export type StringLiteral = CreateASTType<'StringLiteral', {value: string}>;
export let StringLiteral = createASTFactory<StringLiteral>('StringLiteral', 'value');
export type NumberLiteral = CreateASTType<'NumberLiteral', {value: string}>;
export let NumberLiteral = createASTFactory<NumberLiteral>('NumberLiteral', 'value');
export type Identifier = CreateASTType<'Identifier', {name: string}>;
export let Identifier = createASTFactory<Identifier>('Identifier', 'name');

export type UnaryOp = CreateASTType<'UnaryOp', {op: '+' | '-' | '++' | '--' | '!' | '~' | 'typeof', value: Expression}>;
export let UnaryOp = createASTFactory<UnaryOp>('UnaryOp', 'op', 'value');
export type BinaryOp = CreateASTType<'BinaryOp', {op: '&&' | '||' | '^^' | '==' | '!=' | '>=' | '<=' | '**' | '+' | '-' | '*' | '/' | '%' | '&' | '|' | '^' | '!' | '~' | '<' | '>' | 'extends' | 'instanceof' | 'subclassof', left: Expression, right: Expression}>;
export let BinaryOp = createASTFactory<BinaryOp>('BinaryOp', 'op', 'left', 'right');
export type TernaryConditional = CreateASTType<'TernaryConditional', {test: Expression, left: Expression, right: Expression}>;
export let TernaryConditional = createASTFactory<TernaryConditional>('BinaryOp', 'test', 'left', 'right');

export type PropertyAccess = CreateASTType<'PropertyAccess', {obj: Expression, prop: Identifier}>;
export let PropertyAccess = createASTFactory<PropertyAccess>('PropertyAccess', 'obj', 'prop');
export type GetItem = CreateASTType<'GetItem', {obj: Expression, index: Expression}>;
export let GetItem = createASTFactory<GetItem>('GetItem', 'obj', 'index');
export type GetSlice = CreateASTType<'GetSlice', {obj: Expression, start: Expression, stop: Expression}>;
export let GetSlice = createASTFactory<GetSlice>('GetSlice', 'obj', 'start', 'stop');

export type Generic = CreateASTType<'Generic', {obj: Expression, generic: Expression[]}>;
export let Generic = createASTFactory<Generic>('Generic', 'obj', 'generic');

export type Expression = StringLiteral | NumberLiteral | Identifier | UnaryOp | BinaryOp | TernaryConditional | PropertyAccess | GetItem | GetSlice | Generic;

export type Assignment = CreateASTType<'Assignment', {type_: Expression, const: boolean, id: Identifier | GetItem, value: Expression}>;
export let Assignment = createASTFactory<Assignment>('Assignment', 'type_', 'const', 'id', 'value');

export type IfStatement = CreateASTType<'IfStatement', {test: Expression, body: Statement[], orelse: Statement[]}>;
export let IfStatement = createASTFactory<IfStatement>('IfStatement', 'test', 'body', 'orelse');
export type ForLoop = CreateASTType<'ForLoop', {initial: Expression, test: Expression, loop: Expression, body: Statement[]}>;
export let ForLoop = createASTFactory<ForLoop>('ForLoop', 'initial', 'test', 'loop', 'body');
export type WhileLoop = CreateASTType<'WhileLoop', {test: Expression, body: Statement[]}>;
export let WhileLoop = createASTFactory<WhileLoop>('WhileLoop', 'test', 'body');

export type Argument = CreateASTType<'Argument', {name: Identifier, type_: Expression | null, value: Expression | null}>;
export let Argument = createASTFactory<Argument>('Argument', 'name', 'type_', 'value');
export type FunctionDefinition = CreateASTType<'FunctionDefinition', {name: Identifier, arguments: Argument[], body: Statement[], orelse: Statement[]}>;
export let FunctionDefinition = createASTFactory<FunctionDefinition>('FunctionDefinition', 'name', 'arguments', 'body');

export type ClassDefinition = CreateASTType<'ClassDefinition', {name: Identifier, superclasses: Expression[], body: Statement[]}>;
export let ClassDefinition = createASTFactory<ClassDefinition>('ClassDefinition', 'name', 'superclasses', 'body');

export type Statement = Assignment | IfStatement | ForLoop | WhileLoop | FunctionDefinition | ClassDefinition;

export type Program = CreateASTType<'Program', {statements: Statement[]}>;
export let Program = createASTFactory<Program>('Program', 'statements');

export type AST = Program | Statement;


export function createAST(tokens: t.Token[]): Program {
    let statements: Statement[] = [];
    let braceCount = 0;
    let buffer: t.Token[] = [];
    for (let token of tokens) {
        if (token.type === 'Space' || token.type === 'Newline') {
            continue;
        } else if (token.type === 'Semicolon' && braceCount === 0) {
            buffer.push(token);
        }
    }
    return Program(tokens.map(x => x.raw).join(''), 0, 0, statements);
}


export function parse(code: string): Program {
    return createAST(t.tokenize(code));
}
