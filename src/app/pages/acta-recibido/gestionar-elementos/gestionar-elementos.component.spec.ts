import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarElementosComponent } from './gestionar-elementos.component';

describe('GestionarElementosComponent', () => {
  let component: GestionarElementosComponent;
  let fixture: ComponentFixture<GestionarElementosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestionarElementosComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarElementosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
