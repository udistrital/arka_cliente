import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BodegaSinAsignarComponent } from './bodega-sin-asignar.component';

describe('BodegaSinAsignarComponent', () => {
  let component: BodegaSinAsignarComponent;
  let fixture: ComponentFixture<BodegaSinAsignarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BodegaSinAsignarComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BodegaSinAsignarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
