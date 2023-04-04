import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAvaluoComponent } from './form-avaluo.component';

describe('FormAvaluoComponent', () => {
  let component: FormAvaluoComponent;
  let fixture: ComponentFixture<FormAvaluoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormAvaluoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormAvaluoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
