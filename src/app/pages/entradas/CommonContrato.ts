import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Contrato } from '../../@core/data/models/entrada/contrato';
import { OrdenadorGasto } from '../../@core/data/models/entrada/ordenador_gasto';
import { Supervisor } from '../../@core/data/models/entrada/supervisor';
import { EntradaHelper } from '../../helpers/entradas/entradaHelper';

@Injectable()
export class CommonContrato {

    constructor(
        private entradasHelper: EntradaHelper,
        private fb: FormBuilder,
    ) { }

    public loadContratos(tipo: string, vigencia: string): Promise<Contrato[]> {
        return new Promise<Contrato[]>(async (resolve) => {
            if (!tipo || !vigencia) {
                resolve([]);
                return;
            }

            this.entradasHelper.getContratos(tipo, vigencia).subscribe(res => {
                if (!res.contratos_suscritos || !res.contratos_suscritos.contrato_suscritos || !res.contratos_suscritos.contrato_suscritos.length) {
                    resolve([]);
                    return;
                }
                const contratos = res.contratos_suscritos.contrato_suscritos.map(c => ({
                    NumeroContratoSuscrito: c.numero_contrato,
                }));
                resolve(contratos);

            });

        });
    }

    public loadContrato(numero: string, vigencia: string): Promise<Contrato> {
        return new Promise<Contrato>(async (resolve) => {
            this.entradasHelper.getContrato(numero, vigencia).subscribe(res => {
                const contrato = new Contrato;
                if (res && res.contrato) {
                    const ordenadorAux = new OrdenadorGasto;
                    const supervisorAux = new Supervisor;
                    ordenadorAux.Id = res.contrato.ordenador_gasto.id;
                    ordenadorAux.NombreOrdenador = res.contrato.ordenador_gasto.nombre_ordenador;
                    ordenadorAux.RolOrdenadorGasto = res.contrato.ordenador_gasto.rol_ordenador;
                    supervisorAux.Id = res.contrato.supervisor.id;
                    supervisorAux.Nombre = res.contrato.supervisor.nombre;
                    supervisorAux.Cargo = res.contrato.supervisor.cargo;
                    supervisorAux.Dependencia = res.contrato.supervisor.dependencia_supervisor;
                    supervisorAux.Sede = res.contrato.supervisor.sede_supervisor;
                    supervisorAux.DocumentoIdentificacion = res.contrato.supervisor.documento_identificacion;
                    contrato.OrdenadorGasto = ordenadorAux;
                    contrato.NumeroContratoSuscrito = res.contrato.numero_contrato_suscrito;
                    contrato.TipoContrato = res.contrato.tipo_contrato;
                    contrato.FechaSuscripcion = res.contrato.fecha_suscripcion;
                    contrato.Supervisor = supervisorAux;
                    resolve(contrato);
                } else {
                    resolve(contrato);
                }
            });
        });
    }

    public loadTipoContratos(): Promise<any[]> {
        return new Promise<Contrato[]>(async (resolve) => {
            this.entradasHelper.getTiposContrato().subscribe((res: any) => {
                resolve(res);
            });
        });
    }

    public checkContrato(contratos: Contrato[], contrato: number) {
        return contratos && contratos.length && !!contratos.find(c => c.NumeroContratoSuscrito === contrato);
    }

    get currentVigencia(): number {
        return new Date().getFullYear();
    }

    get formContrato(): FormGroup {
        return this.fb.group({
            tipoCtrl: ['', [Validators.required]],
            vigenciaCtrl: ['', [Validators.required]],
            contratoCtrl: ['', [
                Validators.required,
                Validators.pattern('^[0-9]{1,4}$')],
            ],
        });
    }

    get ordenadorForm(): FormGroup {
        return this.fb.group({
            ordenadorCtrl: ['', Validators.nullValidator],
        });
    }

    get supervisorForm(): FormGroup {
        return this.fb.group({
            supervisorCtrl: ['', Validators.nullValidator],
        });
    }

}
