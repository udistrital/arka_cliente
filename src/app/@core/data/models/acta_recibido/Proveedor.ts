import { Estado } from './estado';

export class Proveedor {
    Id: number;
    TipoPersona: string;
    NumDocumento: string;
    IdCiudadContacto: number;
    Direccion: string;
    Correo: string;
    Web: string;
    NomAsesor: string;
    TelAsesor: string;
    Descripcion: string;
    PuntajeEvaluacion: number;
    ClasificacionEvaluacion: string;
    Estado: Estado;
    TipoCuentaBancaria: string;
    NumCuentaBancaria: string;
    IdEntidadBancaria: number;
    FechaRegistro: string;
    FechaUltimaModificacion: string;
    NomProveedor: string;
    Anexorut: string;
    Anexorup: string;
    RegimenContributivo: string;
    compuesto: string;
}
