import { RequestManager } from '../../managers/requestManager';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { PopUpManager } from '../../managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../@core/data/users.service';

@Injectable({
    providedIn: 'root',
})
export class ArkaMidInmuebles {

    constructor(
        private rqManager: RequestManager,
        private pUpManager: PopUpManager,
        private translate: TranslateService,
        private userService: UserService,
    ) { }

    public getOneInmueble(id) {
        this.rqManager.setPath('ARKA_SERVICE');
        return this.rqManager.get('inmuebles/' + id).pipe(
            map(
                (res) => {
                    if (res.Message) {
                        this.pUpManager.showErrorAlert('No se pudo consultar el detalle del bien inmueble.');
                        return undefined;
                    }
                    return res;
                },
            ),
        );
    }
}
