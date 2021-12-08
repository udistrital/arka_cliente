import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerComprobanteComponent } from './ver-comprobante.component';

describe('VerComprobanteComponent', () => {
  let component: VerComprobanteComponent;
  let fixture: ComponentFixture<VerComprobanteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerComprobanteComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerComprobanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
