import inquirer from 'inquirer';
import chalk from 'chalk';
import ClienteRepository from '../repositories/clienteRepository.js';
import PlanRepository from '../repositories/planRepository.js';
import ContratoService from '../services/contratoService.js';

const asignarPlanACliente = async () => {
    const clientes = await new ClienteRepository().listar();
    const planes = await new PlanRepository().listar();

    if (!clientes.length || !planes.length) {
        console.log(chalk.yellow('Debe existir al menos un cliente y un plan para crear un contrato.'));
        return;
    }

    const respuestas = await inquirer.prompt([
        {
            type: 'select',
            name: 'idCliente',
            message: 'Seleccione el cliente:',
            loop: false,
            choices: clientes.map(cliente => ({
                name: `${cliente.nombre} (ID ${cliente.id_cliente})`,
                value: cliente.id_cliente,
            })),
        },
        {
            type: 'select',
            name: 'idPlan',
            message: 'Seleccione el plan:',
            choices: planes.map(plan => ({
                name: `${plan.nombre} - ${plan.nivel} - $${plan.precio_base}`,
                value: plan.id_plan,
            })),
        },
    ]);

    const cliente = clientes.find(item => item.id_cliente === respuestas.idCliente);
    const plan = planes.find(item => item.id_plan === respuestas.idPlan);
    const idContrato = await new ContratoService().asociarClientePlan(cliente, plan);

    console.log(chalk.green(`Contrato ${idContrato} creado automáticamente para ${cliente.nombre} con el plan ${plan.nombre}.`));
};

export default asignarPlanACliente;