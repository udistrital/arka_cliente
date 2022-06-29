import { BaseId } from '../base';
import { TipoEspacio } from './tipo_espacio';

export class EspacioFisico extends BaseId {
    Estado: string;
    TipoEspacio: TipoEspacio;
    Nombre: string;
    Codigo: string;
}
