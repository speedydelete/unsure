
import * as util from 'util';
import type {Token, UnaryOpToken, OpToken, LeftParenToken, ExprToken} from './tokenizer';
import {UNARY_OP_TOKEN_TYPES, BIN_OP_TOKEN_TYPES, EXPR_TOKEN_TYPES} from './tokenizer';


const UNARY_OPS = ['++', '--'];
const BIN_OPS = ['*', '/', '+', '-'];
const PRECENDENCE = [['++'], ['--'], ['*', '/'], ['+', '-']];


export type NodeType = 'Program' | 'Literal' | 'BinOp';

export class Node {

    type: NodeType;

    constructor(type: NodeType) {
        this.type = type;
    }

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

function makeNodeSubclass<T extends Record<string, any>>(type: NodeType, props: (keyof T)[]): {new(...args: { [K in keyof T]: T[K] }[keyof T][]): Node & T} {
    function out(...args: any[]) {
        Object.defineProperties(this, Object.fromEntries(props.map((prop, index) => [prop, {value: args[index], enumerable: true}])));
    }
    out.prototype = Object.create(Node.prototype);
    out.prototype.type = type;
    return out as unknown as {new(...args: {[K in keyof T]: T[K]}[keyof T][]): Node & T};
}

export const Program = makeNodeSubclass<{statements: Node[]}>('Program', ['statements']);
export const Literal = makeNodeSubclass<{value: number}>('Literal', ['value']);
export const UnaryOp = makeNodeSubclass<{op: typeof UNARY_OPS[number]}>('Literal', ['op']);
export const BinOp = makeNodeSubclass<{op: typeof BIN_OPS[number]}>('BinOp', ['op']);


function precedence(op: OpToken): number {
    for (let i = 0; i < PRECENDENCE.length; i++) {
        const category = PRECENDENCE[i];
        if (category.includes(op.type)) {
            return i;
        }
    }
}

function shuntingYard(tokens: Token[]): Token[] {
    let output: ExprToken[] = [];
    let stack: (OpToken | LeftParenToken)[] = [];
    while (tokens.length > 0 && EXPR_TOKEN_TYPES.includes(tokens[0].type)) {
        const token = tokens.splice(0, 1)[0];
        if (token.type === 'IntLiteral') {
            output.push(token);
        } else if (UNARY_OP_TOKEN_TYPES.includes(token.type)) {
            stack.push(token as UnaryOpToken);
        } else if (BIN_OP_TOKEN_TYPES.includes(token.type)) {
            while (stack.length > 0) {
                const token2 = stack[stack.length - 1];
                if (token2.type === 'LeftParen' || precedence(token2) >= precedence(token as OpToken)) {
                    break;
                }
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

export function generateAST(tokens: Token[]): InstanceType<typeof Program> {
    tokens = tokens.filter(token => token.type !== 'Space' && token.type !== 'Newline');
    let out = [new Program([new Program([new Program()])])];
    while (tokens.length > 0) {
        const token = tokens[0];
        if (false) {
        } else if (EXPR_TOKEN_TYPES.includes(token.type)) {
            const shunted = shuntingYard(tokens);
            console.log(shunted);
        } else {
            throw new SyntaxError(`unexpected token ${token.raw} at position ${token.pos}`);
        }
    }
    return new Program(out);
}
