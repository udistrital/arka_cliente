import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaInmueblesComponent } from './consulta-inmuebles.component';

describe('ConsultaInmueblesComponent', () => {
  let component: ConsultaInmueblesComponent;
  let fixture: ComponentFixture<ConsultaInmueblesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaInmueblesComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaInmueblesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
