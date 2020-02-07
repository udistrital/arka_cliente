import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificacionElementosComponent } from './verificacion-elementos.component';

describe('VerificacionElementosComponent', () => {
  let component: VerificacionElementosComponent;
  let fixture: ComponentFixture<VerificacionElementosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerificacionElementosComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerificacionElementosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
