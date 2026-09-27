class Contrato {
    constructor({idCliente, idPlan, condiciones, precio, fechaInicio, fechaFin, estado}){
        this.idCliente = idCliente;
        this.idPlan = idPlan;
        this.condiciones = condiciones;
        this.precio = precio;
        this.fechaInicio = fechaInicio ? new Date(fechaInicio) : null;
        this.fechaFin = fechaFin ? new Date(fechaFin) : null;
        this.estado = estado;
        this.validar();
    }

    validar(){
        if (!this.idCliente || !this.idPlan){
            throw new Error("Los identificadores de cliente y plan son obligatorios.");
        }
        if (this.precio === undefined || typeof this.precio !== 'number' || this.precio < 0){
            throw new Error("El precio es obligatorio y debe ser mayor a 0.");
        }
        const estadosPermitidos = ['activo', 'renovado', 'cancelado', 'finalizado'];
        if (this.estado && !estadosPermitidos.includes(this.estado)){
            throw new Error(`Estado inválido. Opciones: ${estadosPermitidos.join(', ')}.`);
        }
    }
}

export default Contrato;


/*
const contract = new Contrato({
    idCliente: 1,
    idPlan: 1,
    condiciones: "Entrenar los días especificados...",
    precio: 250,
    fechaInicio: new Date(),
    fechaFin: null,
    estado: "activo"
});

console.log("Contrato creado exitosamente: ", contract);
*/

