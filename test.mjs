
import * as fs from 'fs';
import * as util from 'util';
import * as unsure from './lib/index.js';

let code = fs.readFileSync('./test.uns').toString();

if (process.argv.includes('tokens')) {
    console.log(util.inspect(unsure.tokenize(code), {depth: null, colors: true}));
} else if (process.argv.includes('ast')) {
    console.log(util.inspect(unsure.codeToAST(code), {depth: null, colors: true}));
} else {
    code = unsure.compile(code, 'js');
    fs.writeFileSync('./test.uns.js', code);
}
