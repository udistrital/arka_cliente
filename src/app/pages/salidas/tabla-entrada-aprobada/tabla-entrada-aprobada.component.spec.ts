import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaEntradaAprobadaComponent } from './tabla-entrada-aprobada.component';

describe('TablaEntradaAprobadaComponent', () => {
  let component: TablaEntradaAprobadaComponent;
  let fixture: ComponentFixture<TablaEntradaAprobadaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TablaEntradaAprobadaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablaEntradaAprobadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
