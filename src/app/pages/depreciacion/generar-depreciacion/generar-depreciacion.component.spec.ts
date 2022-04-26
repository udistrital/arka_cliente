import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarDepreciacionComponent } from './generar-depreciacion.component';

describe('GenerarDepreciacionComponent', () => {
  let component: GenerarDepreciacionComponent;
  let fixture: ComponentFixture<GenerarDepreciacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenerarDepreciacionComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerarDepreciacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
