
import type {Node} from './ast';
import {Identifier, parse, Program} from './ast';

export function runAST(node: Node): any {
    if (node instanceof Program) {
        let out: any;
        for (const statement of node.statements) {
            out = runAST(statement);
        }
        return out;
    } else if (node instanceof Identifier) {
        throw new 
    } else if (node instanceof )
}

export function run(code: string): any {
    return runAST(parse(code));
}
