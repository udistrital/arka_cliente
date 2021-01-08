import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaBajaBienComponent } from './consulta-baja-bien.component';

describe('ConsultaBajaBienComponent', () => {
  let component: ConsultaBajaBienComponent;
  let fixture: ComponentFixture<ConsultaBajaBienComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaBajaBienComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaBajaBienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
