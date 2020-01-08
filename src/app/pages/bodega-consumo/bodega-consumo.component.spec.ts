import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BodegaConsumoComponent } from './bodega-consumo.component';

describe('BodegaConsumoComponent', () => {
  let component: BodegaConsumoComponent;
  let fixture: ComponentFixture<BodegaConsumoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BodegaConsumoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BodegaConsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
