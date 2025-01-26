
import type {Node} from './ast';
import {parse, Program, Identifier, Literal, UnaryOp, BinOp} from './ast';

export class UnsureError extends Error {}
export class InvalidASTError extends UnsureError {}
export class NameError extends UnsureError {}

export function runAST(node: Node): any {
    if (node instanceof Program) {
        let out: any;
        for (const statement of node.statements) {
            out = runAST(statement);
        }
        return out;
    } else if (node instanceof Identifier) {
        throw new NameError(`${node.name} is not defined`);
    } else if (node instanceof Literal) {
        return node.value;
    } else if (node instanceof UnaryOp) {
        if (node.op === '++') {
            return runAST(node.x) + 1;
        } else if (node.op === '--') {
            return runAST(node.x) - 1;
        } else {
            throw new InvalidASTError(`invalid UnaryOp op parameter: ${node.op}`);
        }
    } else if (node instanceof BinOp) {
        if (node.op === '+') {
            return runAST(node.a) + runAST(node.b);
        } else if (node.op === '-') {
            return runAST(node.a) - runAST(node.b);
        } else if (node.op === '*') {
            return runAST(node.a) * runAST(node.b);
        } else if (node.op === '/') {
            return runAST(node.a) / runAST(node.b);
        } else {
            throw new InvalidASTError(`invalid BinOp op parameter: ${node.op}`);
        }
    } else {
        throw new InvalidASTError(`invalid AST node ${JSON.stringify(node)}`);
    }
}

export function run(code: string): any {
    return runAST(parse(code));
}
