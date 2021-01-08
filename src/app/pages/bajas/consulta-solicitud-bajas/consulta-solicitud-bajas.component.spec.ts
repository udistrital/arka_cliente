import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaSolicitudBajasComponent } from './consulta-solicitud-bajas.component';

describe('ConsultaSolicitudBajasComponent', () => {
  let component: ConsultaSolicitudBajasComponent;
  let fixture: ComponentFixture<ConsultaSolicitudBajasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaSolicitudBajasComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaSolicitudBajasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
