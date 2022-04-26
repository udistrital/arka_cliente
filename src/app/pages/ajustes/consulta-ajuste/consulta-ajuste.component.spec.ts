import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaAjusteComponent } from './consulta-ajuste.component';

describe('ConsultaAjusteComponent', () => {
  let component: ConsultaAjusteComponent;
  let fixture: ComponentFixture<ConsultaAjusteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaAjusteComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaAjusteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
