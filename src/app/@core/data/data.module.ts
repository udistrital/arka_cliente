import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from './state.service';
import { ConfiguracionService } from './configuracion.service';
import { MenuService } from './menu.service';
import { UserService } from './users.service';

const SERVICES = [
  StateService,
  ConfiguracionService,
  UserService,
  MenuService,
];

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    ...SERVICES,
  ],
})
export class DataModule {
  static forRoot(): ModuleWithProviders<DataModule> {
    return <ModuleWithProviders>{
      ngModule: DataModule,
      providers: [
        ...SERVICES,
      ],
    };
  }
}
