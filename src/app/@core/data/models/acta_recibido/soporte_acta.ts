import { Base } from '../base';
import { ActaRecibido } from './acta_recibido';
import { Proveedor } from './Proveedor';

export class SoporteActa extends Base {
    Consecutivo: string;
    DocumentoId: number;
    FechaSoporte: Date;
    ActaRecibidoId: ActaRecibido;
}

export class Ubicacion {
    Id: number;
    Codigo: string;
    Nombre: string; // CAMBIAR POR MODELO CUANDO SE PUEDA CONSULTAR
    Estado: string;
}

export class SoporteActaProveedor extends Base {
    Consecutivo: string;
    Proveedor: Proveedor; // CAMBIAR POR MODELO CUANDO SE PUEDA CONSULTAR
    FechaSoporte: Date;
    ActaRecibidoId: ActaRecibido;
}
