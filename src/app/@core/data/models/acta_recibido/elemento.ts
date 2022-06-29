import { TipoBien } from './tipo_bien';
import { EstadoElemento } from './estado_elemento';
import { SoporteActa } from './soporte_acta';
import { UnidadMedida } from '../unidad_medida/unidad_medida';
import { ParametrosGobierno } from '../parametros_gobierno/parametros_gobierno';
import { ActaRecibido } from './acta_recibido';
import { Detalle } from '../catalogo/detalle';
import { Base } from '../base';

export class Elemento extends Base {
    Nombre: string;
    Cantidad: number;
    Marca: string;
    Serie: string;
    UnidadMedida: number;
    ValorUnitario: number;
    Subtotal: number;
    Descuento: number;
    ValorTotal: number;
    PorcentajeIvaId: number; // Remplazar por modelo cuando este disponoble
    ValorIva: number;
    ValorFinal: number;
    SubgrupoCatalogoId: number; // Remplazar por modelo cuando este disponoble
    EstadoElementoId: EstadoElemento;
    EspacioFisicoId: number;
    ActaRecibidoId: ActaRecibido;
    Placa: string;
}

export class Impuesto extends Base {
    Tarifa: number;
    PorcentajeAplicacion: number;
    BaseUvt: number;
    BasePesos: number;
    InicioVigencia: Date;
    FinVigencia: Date;
    Decreto: string;
    ImpuestoId: string;
    Nombre: string;
}

export class ElementoActa extends Base {
    Nombre: string;
    Cantidad: number;
    Marca: string;
    Serie: string;
    UnidadMedida: number;
    ValorUnitario: number;
    Subtotal: number;
    Descuento: number;
    ValorTotal: number;
    PorcentajeIvaId: ParametrosGobierno;
    ValorIva: number;
    ValorFinal: number;
    SubgrupoCatalogoId: Detalle;
    EstadoElementoId: EstadoElemento;
    EspacioFisicoId: number;
    ActaRecibidoId: ActaRecibido;
    Placa: string;
    VidaUtil: number;
    ValorResidual: number;
}

export class ElementoActaTabla extends ElementoActa {
    Combinado: string;
}
