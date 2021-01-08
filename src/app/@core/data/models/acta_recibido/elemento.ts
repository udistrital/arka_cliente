import { TipoBien } from './tipo_bien';
import { EstadoElemento } from './estado_elemento';
import { SoporteActa } from './soporte_acta';
import { UnidadMedida } from '../unidad_medida/unidad_medida';
import { ParametrosGobierno } from '../parametros_gobierno/parametros_gobierno';

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
    Verificado: boolean;
    TipoBienId: TipoBien;
    EstadoElementoId: EstadoElemento;
    SoporteActaId: SoporteActa;
    Activo: boolean;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Placa: string;
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
    UnidadMedidaId: UnidadMedida;
    ValorUnitario: number;
    Subtotal: number;
    Descuento: number;
    ValorTotal: number;
    PorcentajeIvaId: ParametrosGobierno;
    ValorIva: number;
    ValorFinal: number;
    SubgrupoCatalogoId: number; // Remplazar por modelo cuando este disponoble
    Verificado: boolean;
    TipoBienId: TipoBien;
    EstadoElementoId: EstadoElemento;
    SoporteActaId: SoporteActa;
    Activo: boolean;
    FechaCreacion: Date;
    FechaModificacion: Date;
    Placa: string;
}
