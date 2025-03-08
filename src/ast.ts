
import * as t from './tokenizer';


export interface BaseAST {
    name: string;
    raw: string;
    line: number;
    col: number;
}

type CreateASTType<Type extends string, T extends {[key: string]: unknown} = {}> = BaseAST & {type: Type} & T;

function createASTFactory<T extends BaseAST>(type: string, ...names: string[]): (raw: string, line: number, col: number, ...args: T[keyof Omit<T, keyof BaseAST>][]) => T {
    return function(raw: string, line: number, col: number, ...args: T[keyof Omit<T, keyof BaseAST>][]): T {
        // @ts-ignore // why
        return Object.assign(Token(type, raw, line, col), Object.fromEntries(names.map((name, i) => [name, args[i]])));
    }
}


export type Program = CreateASTType<'Program', {statements: AST[]}>;
export let Program = createASTFactory<Program>('Program', 'statements');

export type AST = Program;


export function createAST(tokens: t.Token[]): Program {
    return Program('', 0, 0, []);
}
