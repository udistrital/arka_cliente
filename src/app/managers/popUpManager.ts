import { Injectable } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
    providedIn: 'root',
})
export class PopUpManager {
    constructor(
        private toast: NbToastrService,
        private translate: TranslateService,
    ) { }
    /**
     * showToast
     */
    public showToast(status, message: string, tittle = '') {
        this.toast.show(message, tittle, { status });
    }

    public showErrorToast(message: string) {
        const status: any = 'danger';
        this.toast.show(message, this.translate.instant('GLOBAL.error'), { status });
    }

    public showInfoToast(message: string, duration: number = 0) {
        const status: any = 'info';
        this.toast.show(message, this.translate.instant('GLOBAL.info'), { status, duration });
    }

    public showSuccesToast(message: string) {
        const status: any = 'success';
        this.toast.show(message, this.translate.instant('GLOBAL.info'), { status });
    }

    public showAlert(status: string, text: string, titulo: string = status) {
        (Swal as any).fire({
            type: status,
            title: titulo,
            text: text,
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
    }

    public showSuccessAlert(text) {
        (Swal as any).fire({
            type: 'success',
            title: this.translate.instant('GLOBAL.operacion_exitosa'),
            text: text,
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
    }

    public showErrorAlert(text) {
        (Swal as any).fire({
            type: 'error',
            title: this.translate.instant('GLOBAL.error'),
            text: text,
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
    }
}
