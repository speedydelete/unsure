
import {readFileSync} from 'fs';
import type * as a from './ast';


export const HEADER = readFileSync('./src/unsure.js');

export const UNARY_OP_SYMBOLS = {
    '+': 's.unary_plus',
    '-': 's.unary_minus',
    '++': 's.increment',
    '--': 's.decrement',
    '!': 's.not',
    '~': 's.boolean_not',
    'typeof': 's.typeof',
};

export const BINARY_OP_SYMBOLS = {
    '&&': 's.boolean_and',
    '||': 's.boolean_or',
    '^^': 's.boolean_xor',
    '==': 's.eq',
    '!=': 's.ne',
    '<': 's.lt',
    '<=': 's.le',
    '>': 's.gt',
    '>=': 's.ge',
    '**': 's.exp',
    '+': 's.add',
    '-': 's.sub',
    '*': 's.mul',
    '/': 's.div',
    '%': 's.mod',
    '&': 's.and',
    '|': 's.or',
    '^': 's.xor',
    'extends': 's.extends_',
    'instanceof': 's.is_instance',
    'subclassof': 's.is_subclass',
    '!': 's.not',
    '~': 's.boolean_not',
    'typeof': 's.typeof',
};


function compile(ast: a.Node): string {
    if (ast.type === 'Identifier') {
        return '$' + ast.name;
    } else if (ast.type === 'StringLiteral') {
        return 'string(' + JSON.stringify(ast.value) + ')';
    } else if (ast.type === 'ByteLiteral') {
        return 'byte(' + ast.value + ')';
    } else if (ast.type === 'ShortLiteral') {
        return 'short(' + ast.value + ')';
    } else if (ast.type === 'IntLiteral') {
        return 'int32(' + ast.value + ')';
    } else if (ast.type === 'LongLiteral') {
        return 'long(' + ast.value + ')';
    } else if (ast.type === 'BigintLiteral') {
        return 'bigint(' + ast.value + ')';
    } else if (ast.type === 'FloatLiteral') {
        return 'float32(' + ast.value + ')';
    } else if (ast.type === 'DoubleLiteral') {
        return 'double(' + ast.value + ')';
    } else if (ast.type === 'UnaryOp') {
        return compile(ast.value) + '[' + UNARY_OP_SYMBOLS[ast.op] + ']()';
    } else if (ast.type === 'BinaryOp') {
        return compile(ast.left) + '[' + BINARY_OP_SYMBOLS[ast.op] + '](' + compile(ast.right) + ')';
    } else if (ast.type === 'TernaryConditional') {
        return compile(ast.test) + '[s.ternary_conditional](' + compile(ast.if_true) + ',' + compile(ast.if_false) + ')';
    } else if (ast.type === 'TypedAssignment') {
        return (ast.const ? 'const' : 'let') + ' ' + compile(ast.id) + '=' + compile(ast.value);
    } else if (ast.type === 'Assignment') {
        return (ast.declare ? (ast.const ? 'const ' : 'let ') : '') + compile(ast.id) + '=' + compile(ast.value);
    } else {
        throw new TypeError(`AST nodes of type ${ast.type} are not supported yet`);
    }
}

export function astToJS(ast: a.AST): string {
    let out: string;
    if (ast.type === 'Program') {
        out = '';
        for (let statement of ast.statements) {
            out += compile(statement);
        }
    } else {
        out = compile(ast);
    }
    return HEADER + ';let $__debug__ = undefined;' + out + ';if($__debug__!==undefined){console.log($__debug__);};';
}
