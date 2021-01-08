import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CapturarElementosComponent } from './capturar-elementos.component';

describe('CapturarElementosComponent', () => {
  let component: CapturarElementosComponent;
  let fixture: ComponentFixture<CapturarElementosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CapturarElementosComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CapturarElementosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
