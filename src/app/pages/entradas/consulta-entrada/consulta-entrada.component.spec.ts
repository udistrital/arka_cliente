import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaEntradaComponent } from './consulta-entrada.component';

describe('ConsultaEntradaComponent', () => {
  let component: ConsultaEntradaComponent;
  let fixture: ComponentFixture<ConsultaEntradaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaEntradaComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaEntradaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
