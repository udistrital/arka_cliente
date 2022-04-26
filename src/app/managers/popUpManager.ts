import { Injectable } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { NbToastrConfig } from '@nebular/theme/components/toastr/toastr-config';
import { NbToastStatus as s } from '@nebular/theme/components/toastr/model';
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
    public showToast(config: Partial<NbToastrConfig> | string, message: string, tittle = '') {
        if (typeof config === 'string')
            config = {status: <s>config};
        this.toast.show(message, tittle, config);
    }

    public showErrorToast(message: string) {
        this.showToast({status: s.DANGER}, message, this.translate.instant('GLOBAL.error'));
    }

    public showInfoToast(message: string, duration: number = 0) {
        this.showToast({status: s.INFO, duration}, message, this.translate.instant('GLOBAL.info'));
    }

    public showSuccesToast(message: string) {
        this.showToast({status: s.SUCCESS}, message, this.translate.instant('GLOBAL.info'));
    }

    public showAlert(status: string, text: string, titulo: string = status) {
        return this.showAlertWithOptions({
            type: status,
            title: titulo,
            text: text,
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
    }

    public showAlertWithOptions(options: any) {
        return (Swal as any).fire(options);
    }

    public showSuccessAlert(text) {
        return this.showAlert('success', text,
            this.translate.instant('GLOBAL.operacion_exitosa'));
    }

    public showErrorAlert(text) {
        return this.showAlert('error', text,
            this.translate.instant('GLOBAL.error'));
    }
}
