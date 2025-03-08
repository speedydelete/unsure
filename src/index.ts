
import * as t from './tokenizer';
import * as a from './ast';
import {astToJS} from './code_gen_js';


export {tokenize} from './tokenizer';
export * as tokens from './tokenizer';
export * as t from './tokenizer';

export {tokensToAST, codeToAST, parse} from './ast';
export * as ast from './ast';
export * as a from './ast';

export {astToJS} from './code_gen_js';


export function astToCode(ast: a.AST, target: 'js'): string {
    if (target === 'js') {
        return astToJS(ast);
    } else {
        throw new TypeError(`invalid target: ${target}`);
    }
}

export function tokensToCode(tokens: t.Token[], target: 'js'): string {
    return astToCode(a.tokensToAST(tokens), target);
}

export function compile(code: string, target: 'js'): string {
    return astToCode(a.parse(code), target);
}

export default compile;
