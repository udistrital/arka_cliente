// A partir de las abreviaciones de ACTA_RECIBIDO_SERVICE/estado_acta
export enum EstadoActa_t {
    Registrada = 1,
    EnElaboracion,
    EnModificacion,
    EnVerificacion,
    Aceptada,
    AsociadoEntrada,
    Anulada,
}

export class EstadoActa {
    Id: EstadoActa_t;
    Nombre: string;
    Descripcion: string;
    CodigoAbreviacion: string;
    Activo: boolean;
    NumeroOrden: number;
    FechaCreacion: Date;
    FechaModificacion: Date;
}
