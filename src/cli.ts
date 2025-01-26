
import * as fs from 'fs';
import {program} from 'commander';
import {run} from './interpreter';

program.name('unsure');
program.description('The unsure programming language');
program.version('0.2.0', '-v, --version', 'displays the version');
program.helpOption('-h, --help', 'display help for command');

program.argument('[path]', 'the file path of the program to run');
program.option('-c, --code <code>', 'the code to run');

program.parse()
const options = program.opts();

if (options.code !== undefined) {
    console.log(run(options.code));
} else {
    const code = fs.readFileSync(program.args[0]).toString();
    console.log(run(code));
}

