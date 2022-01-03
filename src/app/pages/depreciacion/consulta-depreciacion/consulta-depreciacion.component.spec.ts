import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaDepreciacionComponent } from './consulta-depreciacion.component';

describe('ConsultaDepreciacionComponent', () => {
  let component: ConsultaDepreciacionComponent;
  let fixture: ComponentFixture<ConsultaDepreciacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaDepreciacionComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaDepreciacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
