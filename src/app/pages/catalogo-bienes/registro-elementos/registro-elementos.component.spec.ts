import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroElementosComponent } from './registro-elementos.component';

describe('RegistroElementosComponent', () => {
  let component: RegistroElementosComponent;
  let fixture: ComponentFixture<RegistroElementosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroElementosComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroElementosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
