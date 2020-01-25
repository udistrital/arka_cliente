import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaKardexComponent } from './consulta-kardex.component';

describe('ConsultaKardexComponent', () => {
  let component: ConsultaKardexComponent;
  let fixture: ComponentFixture<ConsultaKardexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaKardexComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaKardexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
