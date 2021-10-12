import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroTipoBienComponent } from './registro-tipo-bien.component';

describe('RegistroTipoBienComponent', () => {
  let component: RegistroTipoBienComponent;
  let fixture: ComponentFixture<RegistroTipoBienComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroTipoBienComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroTipoBienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
