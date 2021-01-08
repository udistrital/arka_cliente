import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaSalidasComponent } from './consulta-salidas.component';

describe('ConsultaSalidasComponent', () => {
  let component: ConsultaSalidasComponent;
  let fixture: ComponentFixture<ConsultaSalidasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaSalidasComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaSalidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
