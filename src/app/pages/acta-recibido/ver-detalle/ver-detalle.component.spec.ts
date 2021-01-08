import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDetalleComponent } from './ver-detalle.component';

describe('VerDetalleComponent', () => {
  let component: VerDetalleComponent;
  let fixture: ComponentFixture<VerDetalleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerDetalleComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
