import { ActaRecibido } from './acta_recibido';
import { Proveedor } from './Proveedor';

export class SoporteActa {
    Id: number;
    Consecutivo: string;
    ProveedorId: number; // CAMBIAR POR MODELO CUANDO SE PUEDA CONSULTAR
    FechaSoporte: Date;
    DocumentoId: number;
    ActaRecibidoId: ActaRecibido;
    Activo: boolean;
    FechaCreacion: Date;
    FechaModificacion: Date;
}

export class Ubicacion {
    Id: number;
    Codigo: string;
    Nombre: string; // CAMBIAR POR MODELO CUANDO SE PUEDA CONSULTAR
    Estado: string;
}

export class SoporteActaProveedor {
    Id: number;
    Consecutivo: string;
    Proveedor: Proveedor; // CAMBIAR POR MODELO CUANDO SE PUEDA CONSULTAR
    FechaSoporte: Date;
    ActaRecibidoId: ActaRecibido;
    Activo: boolean;
    FechaCreacion: Date;
    FechaModificacion: Date;
}
