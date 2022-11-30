/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Location, APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { CoreModule } from './@core/core.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ThemeModule } from './@theme/theme.module';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslatePipe } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CdkTableModule } from '@angular/cdk/table';
import { ImplicitAutenticationService } from './@core/utils/implicit_autentication.service';
import { A11yModule } from '@angular/cdk/a11y';
import { BidiModule } from '@angular/cdk/bidi';
import { ObserversModule } from '@angular/cdk/observers';
import { OverlayModule } from '@angular/cdk/overlay';
import { PlatformModule } from '@angular/cdk/platform';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTreeModule } from '@angular/cdk/tree';
import { ListService } from './@core/store/services/list.service';
import { Store, StoreModule } from '@ngrx/store';
import { rootReducer } from './@core/store/rootReducer';
import { LoginComponent } from './login/login.component';
import { LoadComponent } from './load/load.component';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  exports: [
    // CDK
    A11yModule,
    BidiModule,
    ObserversModule,
    OverlayModule,
    PlatformModule,
    PortalModule,
    ScrollingModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    // Material
  ],
})
export class MaterialModule {}


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoadComponent,
  ],
  imports: [
    CdkTableModule,
    StoreModule.forRoot(rootReducer),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    MaterialModule,
    ThemeModule.forRoot(),
    CoreModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [
    TranslateModule,
    TranslatePipe,
  ],
  bootstrap: [AppComponent],
  providers: [
    ImplicitAutenticationService,
    ListService,
    { provide: APP_BASE_HREF, useValue: '/' },
  ],
})

export class AppModule {
}
