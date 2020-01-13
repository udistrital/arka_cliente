import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaSolicitudComponent } from './consulta-solicitud.component';

describe('ConsultaSolicitudComponent', () => {
  let component: ConsultaSolicitudComponent;
  let fixture: ComponentFixture<ConsultaSolicitudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaSolicitudComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
