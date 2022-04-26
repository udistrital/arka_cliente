import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormResolucionComponent } from './form-resolucion.component';

describe('FormResolucionComponent', () => {
  let component: FormResolucionComponent;
  let fixture: ComponentFixture<FormResolucionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormResolucionComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormResolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
