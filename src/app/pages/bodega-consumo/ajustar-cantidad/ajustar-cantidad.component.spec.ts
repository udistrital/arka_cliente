import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AjustarCantidadComponent } from './ajustar-cantidad.component';

describe('AjustarCantidadComponent', () => {
  let component: AjustarCantidadComponent;
  let fixture: ComponentFixture<AjustarCantidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AjustarCantidadComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AjustarCantidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
