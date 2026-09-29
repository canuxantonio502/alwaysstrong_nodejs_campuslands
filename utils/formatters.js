export const formatoFechaMySQL = (fecha) => {
    if (!fecha) return null;
    const d = new Date(fecha);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};


export const formatoMoneda = (monto) => `Q${Number(monto ?? 0).toFixed(2)}`;

// Para mostrar fechas que vienen de MySQL en las tablas.
export const formatoFechaVisible = (fecha) => fecha ? new Date(fecha).toISOString().slice(0, 10) : '-';