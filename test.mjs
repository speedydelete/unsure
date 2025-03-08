
import * as fs from 'fs';
import * as util from 'util';
import * as unsure from './lib/index.js';

let code = fs.readFileSync('./test.uns').toString();

code = unsure.compile(code, 'js');

fs.writeFileSync('./test.uns.js', code);
