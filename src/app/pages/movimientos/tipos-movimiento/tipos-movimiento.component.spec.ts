import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposMovimientoComponent } from './tipos-movimiento.component';

describe('TiposMovimientoComponent', () => {
  let component: TiposMovimientoComponent;
  let fixture: ComponentFixture<TiposMovimientoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TiposMovimientoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TiposMovimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
