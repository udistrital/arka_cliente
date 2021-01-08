import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaBajasComponent } from './consulta-bajas.component';

describe('ConsultaBajasComponent', () => {
  let component: ConsultaBajasComponent;
  let fixture: ComponentFixture<ConsultaBajasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaBajasComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaBajasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
