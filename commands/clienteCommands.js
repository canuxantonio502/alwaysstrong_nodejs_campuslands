import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import ClienteRepository from '../repositories/clienteRepository.js';
import Cliente from '../models/cliente.js';

const pausar = async () => {
    console.log('\n');
    await inquirer.prompt([
        {
            type: 'input',
            name: 'enter',
            message: `Presiona ${chalk.green('ENTER')} para continuar...`
        }
    ]);
}

const mostrarMenuCliente = async () => {
    let salir = false;

    while (!salir) {
        console.clear();
        console.log(chalk.blue.bold('============================================'));
        console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
        console.log(chalk.blue.bold('=------------------------------------------='));
        console.log(chalk.blue.bold('=            GESTIÓN DE CLIENTES           ='));
        console.log(chalk.blue.bold('============================================'));

        const { opcion } = await inquirer.prompt([
            {
                type: 'select',
                name: 'opcion',
                message: '¿Qué desea hacer?',
                choices: [
                    { name: `1. ${chalk.cyan('Crear')} un nuevo cliente`, value: 'crear' },
                    { name: `2. ${chalk.cyan('Buscar')} cliente por ID`, value: 'buscar' },
                    { name: `3. ${chalk.cyan('Listar')} todos los clientes`, value: 'listar' },
                    { name: `4. ${chalk.cyan('Actualizar')} cliente`, value: 'actualizar' },
                    { name: `5. ${chalk.cyan('Eliminar')} cliente`, value: 'eliminar' },
                    new inquirer.Separator(),
                    { name: chalk.red('0. Regresar'), value: 'regresar' }
                ]
            }
        ]);

        switch (opcion) {
            case 'crear':
                console.clear()
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold('=         CREACIÓN DE NUEVO CLIENTE        ='));
                console.log(chalk.blue.bold('============================================'));

                const nuevoCliente = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'nombre',
                        message: 'Ingrese el nombre del cliente: '
                    },
                    {
                        type: 'input',
                        name: 'telefono',
                        message: 'Ingrese el teléfono del cliente: '
                    },
                    {
                        type: 'input',
                        name: 'correo',
                        message: 'Ingrese el correo del cliente: '
                    },
                    {
                        type: 'input',
                        name: 'fechaIngreso',
                        message: 'Ingrese la fecha de ingreso (AAAA-MM-DD): '
                    }
                ]);
                try {
                    const cliente = new Cliente(nuevoCliente);
                    const clienteRepository = new ClienteRepository();
                    const id = await clienteRepository.crear(cliente);
                    console.log(`Cliente creado con ID: ${id}`);
                } catch (error) {
                    console.log(chalk.red(error.message));
                }
                await pausar();
                break;

            case 'buscar':
                console.clear()
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold('=            BÚSQUEDA DE CLIENTE           ='));
                console.log(chalk.blue.bold('============================================'));
                const { idCliente } = await inquirer.prompt([
                    {
                        type: 'number',
                        name: 'idCliente',
                        message: 'Ingrese el ID del cliente: '
                    }
                ]);
                try {
                    const clienteRepository = new ClienteRepository();
                    const clienteHallado = await clienteRepository.buscarPorId(idCliente);
                    console.log(chalk.blue('============ Cliente encontrado ============'));
                    console.log(JSON.stringify(clienteHallado, null, 2));
                }catch(error){
                    console.log(chalk.red(error.message));
                };
                await pausar();
                break;

            case 'listar':
                console.clear()
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold('=            LISTADO DE CLIENTES           ='));
                console.log(chalk.blue.bold('============================================'));

                const clienteRepository = new ClienteRepository();
                const listaClientes = await clienteRepository.listar();

                // console.log(listaClientes);

                // 1. Inicializar la tabla definiendo los encabezados con color
                const table = new Table({
                    head: [
                        chalk.cyan.bold('ID'),
                        chalk.cyan.bold('Nombre Completo'),
                        chalk.cyan.bold('Correo Electrónico'),
                        chalk.cyan.bold('Activo')
                    ],
                    chars: {
                        'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
                        'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
                        'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
                        'right': '║', 'right-mid': '╢', 'middle': '│'
                    } // Este bloque opcional le da un estilo de bordes dobles muy profesional
                });

                // 2. Recorrer el listado e insertar las filas
                listaClientes.forEach(cliente => {
                    table.push([
                        cliente.id_cliente,
                        cliente.nombre,
                        cliente.correo,
                        cliente.estado
                    ]);
                });

                // 3. Imprimir el resultado final
                console.log(table.toString());
                await pausar();

                break;
            case 'actualizar':
                console.clear()
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold('=         ACTUALIZACIÓN DE CLIENTE         ='));
                console.log(chalk.blue.bold('============================================'));
                const { idClienteUP } = await inquirer.prompt([
                    {
                        type: 'number',
                        name: 'idClienteUP',
                        message: 'Ingrese el ID del cliente a actualizar: '
                    }
                ]);
                const actualizarCliente = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'nombre',
                        message: 'Ingrese el nombre del cliente: '
                    },
                    {
                        type: 'input',
                        name: 'telefono',
                        message: 'Ingrese el teléfono del cliente: '
                    },
                    {
                        type: 'input',
                        name: 'correo',
                        message: 'Ingrese el correo del cliente: '
                    },
                    {
                        type: 'input',
                        name: 'fechaIngreso',
                        message: 'Ingrese la fecha de ingreso (AAAA-MM-DD): '
                    },
                    {
                        type: 'input',
                        name: 'estado',
                        message: 'Ingrese el estado del cliente: '
                    }
                ]);
                try {
                    const clienteRepository = new ClienteRepository();
                    await clienteRepository.actualizar(idClienteUP, actualizarCliente);
                    const clienteActual = await clienteRepository.buscarPorId(idClienteUP);
                    console.log(chalk.blue('============ Cliente actualizado ==========='));
                    console.log(JSON.stringify(clienteActual, null, 2));
                } catch (error) {
                    console.log(chalk.red(error.message));
                }
                await pausar();
                break;
            case 'eliminar':
                console.clear()
                console.log(chalk.blue.bold('============================================'));
                console.log(chalk.blue.bold('=             GYM ALWAYS STRONG            ='));
                console.log(chalk.blue.bold('=------------------------------------------='));
                console.log(chalk.blue.bold('=          ELIMINACIÓN DE CLIENTE          ='));
                console.log(chalk.blue.bold('============================================'));
                const { idClienteDE } = await inquirer.prompt([
                    {
                        type: 'number',
                        name: 'idClienteDE',
                        message: 'Ingrese el ID del cliente: '
                    }
                ]);
                try {
                    const clienteRepository = new ClienteRepository();
                    await clienteRepository.eliminar(idClienteDE);
                    console.log(chalk.blue('============= Cliente eliminado ============'));
                }catch(error){
                    console.log(chalk.red(error.message));
                };
                await pausar();
                break;
            case 'regresar':
                salir = true;
                console.log(chalk.green(`\nRegresando al menu principal...`));
        }
    }
}

export default mostrarMenuCliente;