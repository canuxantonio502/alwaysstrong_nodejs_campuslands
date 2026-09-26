import mostrarMenuPrincipal from './commands/menuPrincipal.js';
import chalk from 'chalk';

const iniciarApp = async () => {
    try {
        await mostrarMenuPrincipal();
    } catch (err) {
        console.error(chalk.red.bold('\nOcurrió un error crítico en la aplicación:'));
        console.error(err);
        process.exit(1);
    }
}

iniciarApp;