import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroCuentasCatalogoComponent } from './registro-cuentas-catalogo.component';

describe('RegistroCuentasCatalogoComponent', () => {
  let component: RegistroCuentasCatalogoComponent;
  let fixture: ComponentFixture<RegistroCuentasCatalogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroCuentasCatalogoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroCuentasCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
