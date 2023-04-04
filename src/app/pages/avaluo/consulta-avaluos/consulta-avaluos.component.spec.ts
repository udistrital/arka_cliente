import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaAvaluosComponent } from './consulta-avaluos.component';

describe('ConsultaAvaluosComponent', () => {
  let component: ConsultaAvaluosComponent;
  let fixture: ComponentFixture<ConsultaAvaluosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaAvaluosComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaAvaluosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
