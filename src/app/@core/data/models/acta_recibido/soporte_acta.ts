import { ActaRecibido } from './acta_recibido';
import { Proveedor } from './Proveedor';

export class SoporteActa {
    Id: number;
    Consecutivo: number;
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
export class Dependencia {
    Id: number;
    Nombre: string;
    TelefonoDependencia: string;
    CorreoElectronico: string;
}

export class SoporteActaProveedor {
    Id: number;
    Consecutivo: number;
    Proveedor: Proveedor; // CAMBIAR POR MODELO CUANDO SE PUEDA CONSULTAR
    FechaSoporte: Date;
    ActaRecibidoId: ActaRecibido;
    Activo: boolean;
    FechaCreacion: Date;
    FechaModificacion: Date;
}
