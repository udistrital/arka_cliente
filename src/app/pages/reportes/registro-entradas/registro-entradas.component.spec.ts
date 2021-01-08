import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroEntradasComponent } from './registro-entradas.component';

describe('RegistroEntradasComponent', () => {
  let component: RegistroEntradasComponent;
  let fixture: ComponentFixture<RegistroEntradasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroEntradasComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroEntradasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
