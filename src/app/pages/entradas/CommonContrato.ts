import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Contrato } from '../../@core/data/models/entrada/contrato';
import { Ordenador, Supervisor } from '../../@core/data/models/terceros_criterio';
import { EntradaHelper } from '../../helpers/entradas/entradaHelper';

@Injectable()
export class CommonContrato {

    Ordenadores: Ordenador[] = [];
    Supervisores: Supervisor[] = [];
    cargandoOrdenadores = true;
    cargandoSupervisores = true;

    constructor(
        private entradasHelper: EntradaHelper,
        private fb: FormBuilder,
    ) { }

    // Mantiene la firma por compatibilidad pero ya no hace fetch
    public loadContratos(tipo: string, vigencia: string): Promise<Contrato[]> {
        return Promise.resolve([]);
    }

    public loadContrato(numero: string, vigencia: string): Promise<Contrato> {
        return Promise.resolve(new Contrato);
    }

    public loadTipoContratos(): Promise<any[]> {
        return Promise.resolve([]);
    }

    // Siempre válido — contrato fijo en 000
    public checkContrato(contratos: Contrato[], contrato: number): boolean {
        return true;
    }

    public loadOrdenadores(control: any): Observable<Ordenador[]> {
        this.entradasHelper.getOrdenadores('ordenadores?limit=-1').subscribe(res => {
            if (Array.isArray(res)) {
                this.Ordenadores = res;
                this.cargandoOrdenadores = false;
            }
        });
        return control.valueChanges.pipe(
            startWith(''),
            map((val: any) => typeof val === 'string' ? val : this.muestraOrdenador(val)),
            map((nombre: string) => this.filtroOrdenadores(nombre)),
        );
    }

    public loadSupervisores(control: any): Observable<Supervisor[]> {
        this.entradasHelper.getSupervisores('supervisor_contrato?limit=-1').subscribe(res => {
            if (Array.isArray(res)) {
                this.Supervisores = res;
                this.cargandoSupervisores = false;
            }
        });
        return control.valueChanges.pipe(
            startWith(''),
            map((val: any) => typeof val === 'string' ? val : this.muestraSupervisor(val)),
            map((nombre: string) => this.filtroSupervisores(nombre)),
        );
    }

    public muestraOrdenador(ord: Ordenador): string {
        return ord && ord.NombreOrdenador ? ord.NombreOrdenador : '';
    }

    public muestraSupervisor(sup: Supervisor): string {
        return sup && sup.Nombre ? sup.Nombre : '';
    }

    private filtroOrdenadores(nombre: string): Ordenador[] {
        return this.Ordenadores.filter(o =>
            o.NombreOrdenador.toLowerCase().includes(nombre.toLowerCase()));
    }

    private filtroSupervisores(nombre: string): Supervisor[] {
        return this.Supervisores.filter(s =>
            s.Nombre.toLowerCase().includes(nombre.toLowerCase()));
    }

    get currentVigencia(): number {
        return new Date().getFullYear();
    }

    get formContrato(): FormGroup {
        return this.fb.group({
            tipoCtrl: [''],
            vigenciaCtrl: [''],
            contratoCtrl: [''],  // sin validators
        });
    }

    get ordenadorForm(): FormGroup {
        return this.fb.group({
            ordenadorCtrl: ['', Validators.required],
        });
    }

    get supervisorForm(): FormGroup {
        return this.fb.group({
            supervisorCtrl: ['', Validators.required],
        });
    }
}
