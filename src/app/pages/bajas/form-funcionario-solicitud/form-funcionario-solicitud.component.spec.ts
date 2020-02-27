import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFuncionarioSolicitudComponent } from './form-funcionario-solicitud.component';

describe('FormFuncionarioSolicitudComponent', () => {
  let component: FormFuncionarioSolicitudComponent;
  let fixture: ComponentFixture<FormFuncionarioSolicitudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormFuncionarioSolicitudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFuncionarioSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
