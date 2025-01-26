
import * as fs from 'fs';
import * as process from 'process';
import * as readline from 'readline/promises';
import {program} from 'commander';
import {run, runEval, Environment} from './interpreter';

async function repl() {
    console.log(`Unsure ${program.version()}`);
    const rl = readline.createInterface({input: process.stdin, output: process.stdout});
    const env = new Environment();
    while (true) {
        const code = await rl.question('>>> ');
        console.log(env.runEval(code));
    }
}

program.name('unsure');
program.description('The Unsure programming language');
program.version('0.2.0', '-v, --version', 'displays the version');
program.helpOption('-h, --help', 'display help for command');

program.argument('[path]', 'the file path of the program to run');
program.option('-c, --code <code>', 'the code to run');

program.parse()
const options = program.opts();

if (options.code !== undefined) {
    console.log(runEval(options.code));
} else if (program.args[0] === undefined) {
    repl();
} else {
    const code = fs.readFileSync(program.args[0]).toString();
    run(code);
}

