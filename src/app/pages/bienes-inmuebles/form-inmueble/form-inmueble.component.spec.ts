import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInmuebleComponent } from './form-inmueble.component';

describe('FormInmuebleComponent', () => {
  let component: FormInmuebleComponent;
  let fixture: ComponentFixture<FormInmuebleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormInmuebleComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormInmuebleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
