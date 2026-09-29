import inquirer from 'inquirer';
import chalk from 'chalk';

export const pausar = async () => {
    console.log('\n');
    await inquirer.prompt([
        { type: 'input', name: 'enter', message: `Presiona ${chalk.green('ENTER')} para continuar...` }
    ]);
};


export const encabezado = (titulo) => {
    console.clear();
    console.log(chalk.blue.bold('============================================'));
    console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
    console.log(chalk.blue.bold('=------------------------------------------='));
    console.log(chalk.blue.bold(`=  ${titulo.padEnd(40).slice(0, 40)}=`));
    console.log(chalk.blue.bold('============================================'));
};