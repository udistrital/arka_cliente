import { TipoBien } from './tipo_bien';
import { EstadoElemento } from './estado_elemento';
import { UnidadMedida } from '../unidad_medida/unidad_medida';
import { ActaRecibido } from './acta_recibido';
import { Detalle } from '../catalogo/detalle';

export class Elemento {
    Id: number;
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
    TipoBienId: number;
    EstadoElementoId: EstadoElemento;
    EspacioFisicoId: number;
    ActaRecibidoId: ActaRecibido;
    Placa: string;
    Activo: boolean;
    FechaCreacion: Date;
    FechaModificacion: Date;
}

export class Impuesto {
    Id: number;
    Activo: boolean;
    Tarifa: number;
    PorcentajeAplicacion: number;
    BaseUvt: number;
    BasePesos: number;
    InicioVigencia: Date;
    FinVigencia: Date;
    Decreto: string;
    FechaCreacion: Date;
    FechaModificacion: Date;
    ImpuestoId: string;
    Nombre: string;
}

export class ElementoActa {
    Id: number;
    Nombre: string;
    Cantidad: number;
    Marca: string;
    Serie: string;
    UnidadMedida: number;
    ValorUnitario: number;
    Subtotal: number;
    Descuento: number;
    ValorTotal: number;
    PorcentajeIvaId: number;
    ValorIva: number;
    ValorFinal: number;
    SubgrupoCatalogoId: Detalle;
    TipoBienId: TipoBien;
    EstadoElementoId: EstadoElemento;
    EspacioFisicoId: number;
    ActaRecibidoId: ActaRecibido;
    Placa: string;
    Activo: boolean;
    FechaCreacion: Date;
    FechaModificacion: Date;
    VidaUtil: number;
    ValorResidual: number;
}

export class ElementoActaTabla extends ElementoActa {
    Combinado: string;
}
