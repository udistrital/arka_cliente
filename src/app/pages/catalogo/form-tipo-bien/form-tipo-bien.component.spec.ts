import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTipoBienComponent } from './form-tipo-bien.component';

describe('FormTipoBienComponent', () => {
  let component: FormTipoBienComponent;
  let fixture: ComponentFixture<FormTipoBienComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormTipoBienComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTipoBienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
