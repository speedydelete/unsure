
import type {Node} from './ast';
import {parse, Program, Identifier, Literal, UnaryOp, BinOp} from './ast';

export class UnsureError extends Error {}
export class InvalidASTError extends UnsureError {}
export class NameError extends UnsureError {}

type Scope = undefined;

export function _run(node: Node, scope?: Scope): any {
    if (node instanceof Program) {
        let out: any;
        for (const statement of node.statements) {
            out = _run(statement);
        }
        return out;
    } else if (node instanceof Identifier) {
        throw new NameError(`${node.name} is not defined`);
    } else if (node instanceof Literal) {
        return node.value;
    } else if (node instanceof UnaryOp) {
        if (node.op === '++') {
            const x = _run(node.x);
            if (typeof x === 'bigint') {
                return x + 1n;
            } else {
                return x + 1;
            }
        } else if (node.op === '--') {
            const x = _run(node.x);
            if (typeof x === 'bigint') {
                return x - 1n;
            } else {
                return x - 1;
            }
        } else {
            throw new InvalidASTError(`invalid UnaryOp op parameter: ${node.op}`);
        }
    } else if (node instanceof BinOp) {
        if (node.op === '+') {
            return _run(node.a) + _run(node.b);
        } else if (node.op === '-') {
            return _run(node.a) - _run(node.b);
        } else if (node.op === '*') {
            return _run(node.a) * _run(node.b);
        } else if (node.op === '/') {
            return _run(node.a) / _run(node.b);
        } else {
            throw new InvalidASTError(`invalid BinOp op parameter: ${node.op}`);
        }
    } else {
        throw new InvalidASTError(`invalid AST node ${JSON.stringify(node)}`);
    }
}

export function run(code: string): void {
    _run(parse(code));
}

export function runEval(code: string): any {
    return _run(parse(code));
}

export function runAST(node: Node): void {
    _run(node);
}

export function runEvalAST(node: Node): any {
    return _run(node);
}

export class Environment {

    scope: Scope;

    constructor() {
        this.scope = undefined;
    }

    _run(node: Node): any {
        return _run(node, this.scope);
    }

    run(code: string): void {
        this._run(parse(code));
    }

    runEval(code: string): any {
        return this._run(parse(code))
    }

    runAST(node: Node): void {
        this._run(node);
    }

    runEvalAST(node: Node): any {
        return this._run(node);
    }

}
