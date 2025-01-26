
import * as fs from 'fs';
import {program} from 'commander';
import {run} from './interpreter';

program.name('unsure');
program.description('The unsure programming language');
program.version('0.2.0');

program.argument('<path>', 'The file path of the program to run');

program.parse()
const options = program.opts();

let code: string;
code = fs.readFileSync(program.args[0]).toString();
console.log(run(code));
