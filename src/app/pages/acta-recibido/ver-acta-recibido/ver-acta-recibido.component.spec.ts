import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerActaRecibidoComponent } from './ver-acta-recibido.component';

describe('VerificacionActaRecibidoComponent', () => {
  let component: VerActaRecibidoComponent;
  let fixture: ComponentFixture<VerActaRecibidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerActaRecibidoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerActaRecibidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
