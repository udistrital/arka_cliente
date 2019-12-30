import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaSalidaEspecificaComponent } from './consulta-salida-especifica.component';

describe('ConsultaSalidaEspecificaComponent', () => {
  let component: ConsultaSalidaEspecificaComponent;
  let fixture: ComponentFixture<ConsultaSalidaEspecificaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaSalidaEspecificaComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaSalidaEspecificaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
