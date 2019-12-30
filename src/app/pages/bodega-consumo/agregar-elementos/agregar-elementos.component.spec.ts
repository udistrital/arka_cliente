import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarElementosComponent } from './agregar-elementos.component';

describe('AgregarElementosComponent', () => {
  let component: AgregarElementosComponent;
  let fixture: ComponentFixture<AgregarElementosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgregarElementosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarElementosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
