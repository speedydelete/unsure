
import * as util from 'util';
import type {Token, UnaryOpToken, OpToken, LeftParenToken, IdentifierToken, LiteralToken, ExprToken} from './tokenizer';
import {UNARY_OP_TOKEN_TYPES, BIN_OP_TOKEN_TYPES, EXPR_TOKEN_TYPES, LITERAL_TOKEN_TYPES, TOKEN_SYMBOLS, tokenize} from './tokenizer';


const UNARY_OPS = ['++', '--'];
const BIN_OPS = ['*', '/', '+', '-'];
const PRECEDENCE = [['++'], ['--'], ['*', '/'], ['+', '-']];


export type NodeType = 'Placeholder' | 'Program' | 'Identifier' | 'Literal' | 'UnaryOp' | 'BinOp';

export class AST {

    type: NodeType = 'Placeholder';

    [Symbol.toStringTag](): string {
        return 'Node';
    }

    [util.inspect.custom](depth: number, options: util.InspectOptionsStylized, inspect: typeof util.inspect): string {
        if (depth < 0) {
            return options.stylize('[' + this.type + ']', 'special');
        }
        const newOptions = Object.assign({}, options, {depth: options.depth === null ? null : options.depth - 1});
        const inner = inspect(Object.fromEntries(Object.entries(this)), newOptions);
        return `${options.stylize(this.type, 'special')} ${inner}`;
    }

}

function makeNodeSubclass<T extends Record<string, any>>(type: NodeType, props: (keyof T)[]): {new(...args: {[K in keyof T]: T[K]}[keyof T][]): AST & T} {
    function out(...args: any[]) {
        Object.defineProperties(this, Object.fromEntries(props.map((prop, index) => [prop, {value: args[index], enumerable: true}])));
    }
    out.prototype = Object.create(AST.prototype);
    out.prototype.type = type;
    return out as unknown as {new(...args: {[K in keyof T]: T[K]}[keyof T][]): AST & T};
}

export const Placeholder = makeNodeSubclass<{}>('Placeholder', []);
export const Program = makeNodeSubclass<{statements: AST[]}>('Program', ['statements']);
export const Identifier = makeNodeSubclass<{name: string}>('Identifier', ['name']);
export const Literal = makeNodeSubclass<{value: BigInt}>('Literal', ['value']);
export const UnaryOp = makeNodeSubclass<{op: typeof UNARY_OPS[number], a: AST}>('UnaryOp', ['op', 'a']);
export const BinOp = makeNodeSubclass<{op: typeof BIN_OPS[number], a: AST, b: AST}>('BinOp', ['op', 'a', 'b']);

export type Node = InstanceType<typeof Placeholder> | InstanceType<typeof Program> | InstanceType<typeof Identifier> | InstanceType<typeof Literal> | InstanceType<typeof UnaryOp> | InstanceType<typeof BinOp>;


function precedence(op: OpToken): number {
    for (let i = 0; i < PRECEDENCE.length; i++) {
        if (PRECEDENCE[i].includes(TOKEN_SYMBOLS.get(op.type))) {
            return i;
        }
    }
}

function shuntingYard(tokens: Token[]): Token[] {
    let output: ExprToken[] = [];
    let stack: (OpToken | LeftParenToken)[] = [];
    while (tokens.length > 0 && EXPR_TOKEN_TYPES.includes(tokens[0].type)) {
        const token = tokens.shift()!;
        if (token.type === 'Identifier' || token.type === 'IntLiteral') {
            output.push(token);
        } else if (UNARY_OP_TOKEN_TYPES.includes(token.type)) {
            stack.push(token as UnaryOpToken);
        } else if (BIN_OP_TOKEN_TYPES.includes(token.type)) {
            while (stack.length > 0) {
                const top = stack[stack.length - 1];
                if (top.type === 'LeftParen' || precedence(top) > precedence(token as OpToken)) {
                    break;
                }
                output.push(stack.pop())
            }
            stack.push(token as OpToken);
        } else if (token.type === 'LeftParen') {
            stack.push(token);
        } else if (token.type === 'RightParen') {
            while (stack[stack.length - 1].type !== 'LeftParen') {
                if (stack.length === 0) {
                    throw new SyntaxError(`mismatched parentheses near position ${token.pos}`);
                }
                output.push(stack.pop());
            }
            stack.pop();
        }
    }
    while (stack.length > 0) {
        const token = stack.pop();
        if (token.type === 'LeftParen') {
            throw new SyntaxError(`mismatched parentheses near position ${token.pos}`);
        }
        output.push(token);
    }
    return output;
}

function generateASTFromExpr(tokens: Token[]): Node {
    const shunted = shuntingYard(tokens);
    let stack: Node[] = [];
    for (const token of shunted) {
        if (token.type === 'Identifier') {
            stack.push(new Identifier(token.name));
        } else if (LITERAL_TOKEN_TYPES.includes(token.type)) {
            stack.push(new Literal((token as LiteralToken).value));
        } else if (UNARY_OP_TOKEN_TYPES.includes(token.type)) {
            stack.push(new UnaryOp(TOKEN_SYMBOLS.get(token.type), stack.pop()));
        } else if (BIN_OP_TOKEN_TYPES.includes(token.type)) {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(new BinOp(TOKEN_SYMBOLS.get(token.type), a, b));
        }
    }
    return stack[0];
}

export function generateAST(tokens: Token[]): InstanceType<typeof Program> {
    tokens = tokens.filter(token => token.type !== 'Space' && token.type !== 'Newline');
    let out: Node[] = [];
    while (tokens.length > 0) {
        const token = tokens[0];
        if (false) {
        } else if (EXPR_TOKEN_TYPES.includes(token.type)) {
            out.push(generateASTFromExpr(tokens));
        } else {
            throw new SyntaxError(`unexpected token ${token.raw} at position ${token.pos}`);
        }
    }
    return new Program(out);
}

export function parse(code: string): InstanceType<typeof Program> {
    return generateAST(tokenize(code));
}
