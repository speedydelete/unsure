
import * as util from 'util';
import {type Token} from './tokenizer';

const BIN_OPS = ['*', '/', '+', '-'];
const PRECENDENCE = [['*', '/'], ['+', '-']];
const EXPR_TOKEN_TYPES = ['Identifier', 'IntLiteral', 'Keyword', 'MulOp', 'DivOp', 'AddOp', 'SubOp'];


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
export const BinOp = makeNodeSubclass<{op: typeof BIN_OPS[number]}>('BinOp', ['op']);


export function generateAST(tokens: Token[]): InstanceType<typeof Program> {
    tokens = tokens.filter(token => token.type !== 'Space' && token.type !== 'Newline');
    let out = [new Program([new Program([new Program()])])];
    while (tokens.length > 0) {
        const token = tokens[0];
        if (false) {
        } else if (EXPR_TOKEN_TYPES.includes(token.type)) {
            tokens.splice(0, 1);
        } else {
            throw new SyntaxError(`unexpected token ${token.raw} at position ${token.pos}`);
        }
    }
    return new Program(out);
}
