class PlanNutricional{
    constructor({idContrato, fechaInicio, fechaFin}){
        this.idContrato = idContrato;
        this.fechaInicio = fechaInicio ? new Date(fechaInicio) : null;
        this.fechaFin = fechaFin ? new Date(fechaFin) : null;
        this.validar();
    }

    validar(){
        if(!this.idContrato){
            throw new Error("El id del contrato es obligatorio.");
        }
        if(this.fechaInicio && this.fechaFin && this.fechaInicio > this.fechaFin){
            throw new Error("La fecha de inicio no puede ser posterior a la fecha de finalización.");
        }
    }
}

export default PlanNutricional;


/*
const plan = new PlanNutricional({
    idContrato: 1,
    fechaInicio: '2025-08-09',
    fechaFin: '2025-08-10'
})

console.log("Clase PlanNutricional creada exitosamente: ", plan);
*/