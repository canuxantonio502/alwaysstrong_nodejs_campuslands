class AlimentoDia{
    constructor({idPlanNutricional, fecha, nombreAlimento, calorias}){
        this.idPlanNutricional = idPlanNutricional;
        this.fecha = new Date(fecha);
        this.nombreAlimento = nombreAlimento;
        this.calorias = calorias;
        this.validar();
    }

    validar(){
        if (!this.idPlanNutricional) throw new Error("El id del Plan Nutricional es obligatorio.");
        if (isNaN(this.fecha.getTime())) throw new Error("La fecha es obligatoria y debe ser válida.");

        if (!this.nombreAlimento || this.nombreAlimento.trim().length === 0 || this.nombreAlimento.length > 100){
            throw new Error("El nombre del alimento es obligatorio y no debe exceder los 100 caracteres.")
        };
        if (this.calorias === undefined || typeof this.calorias !== 'number' || this.calorias < 0 || this.calorias > 9999.99){
            throw new Error("Las calorias son obligatorias y deben estar entre 0 y 9999.99.");
        }
    }
}

export default AlimentoDia;

/*
const alimento = new AlimentoDia({
    idPlanNutricional: 1,
    fecha: '2026-09-25',
    nombreAlimento: "Plátanos",
    calorias: 89
})

console.log("Clase AlimentoDia creada exitosamente: ", alimento);
*/