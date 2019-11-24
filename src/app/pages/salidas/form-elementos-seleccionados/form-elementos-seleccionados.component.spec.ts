import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormElementosSeleccionadosComponent } from './form-elementos-seleccionados.component';

describe('FormElementosSeleccionadosComponent', () => {
  let component: FormElementosSeleccionadosComponent;
  let fixture: ComponentFixture<FormElementosSeleccionadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormElementosSeleccionadosComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormElementosSeleccionadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
