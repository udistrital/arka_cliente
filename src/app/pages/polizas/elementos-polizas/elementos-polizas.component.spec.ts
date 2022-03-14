import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementosPolizasComponent } from './elementos-polizas.component';

describe('ElementosPolizasComponent', () => {
  let component: ElementosPolizasComponent;
  let fixture: ComponentFixture<ElementosPolizasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElementosPolizasComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElementosPolizasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
