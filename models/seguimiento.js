class Seguimiento{
    constructor({idContrato, fecha, peso, grasaCorporal, medidas, fotoUrl, comentarios}){
        this.idContrato = idContrato;
        this.fecha = new Date(fecha);
        this.peso = peso;
        this.grasaCorporal = grasaCorporal;
        this.medidas = medidas;
        this.fotoUrl = fotoUrl;
        this.comentarios = comentarios;
        this.validar();
    }

    validar(){
        if(!this.idContrato){
            throw new Error("El id del contrato es obligatorio.");
        }
        if (isNaN(this.fecha.getTime())) throw new Error("La fecha de seguimiento es inválida o nula.");
        if(this.peso !== undefined && (typeof this.peso !== 'number' || this.peso < 30 || this.peso > 999.99)){
            throw new Error("El peso debe ser un valor razonable entre 30 y 999.99");
        }
        if(this.grasaCorporal !== undefined && (typeof this.grasaCorporal !== 'number' || this.grasaCorporal < 2 || this.grasaCorporal > 99.99)){
            throw new Error("El porcentaje de grasa debe estar entre 2% y 99.99%");
        }
        if(this.medidas && this.medidas.length > 255){
            throw new Error("El texto de medidas no puede exceder los 255 caracteres.");
        }
        if(this.fotoUrl && this.fotoUrl.length > 255){
            throw new Error("Prueba compactando la URL, y que sea menor a 255 caracteres.");
        }
    };
}

export default Seguimiento;


/*
const seguimiento = new Seguimiento({
    idContrato: 3,
    fecha: '2025-09-25',
    peso: 150,
    grasaCorporal: 45,
    medidas: 'Altura...',
    fotoUrl: 'https://...',
    comentarios: 'Seguimiento de muestra...'
})

console.log("Seguimiento creado con exito: ", seguimiento);
*/