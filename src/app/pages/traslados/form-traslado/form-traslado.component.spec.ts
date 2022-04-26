import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTrasladoComponent } from './form-traslado.component';

describe('FormTrasladoComponent', () => {
  let component: FormTrasladoComponent;
  let fixture: ComponentFixture<FormTrasladoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormTrasladoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormTrasladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
