import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroTipoMovimientoComponent } from './registro-tipo-movimiento.component';

describe('RegistroTipoMovimientoComponent', () => {
  let component: RegistroTipoMovimientoComponent;
  let fixture: ComponentFixture<RegistroTipoMovimientoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroTipoMovimientoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroTipoMovimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
