import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroCatalogoComponent } from './registro-catalogo.component';

describe('RegistroCatalogoComponent', () => {
  let component: RegistroCatalogoComponent;
  let fixture: ComponentFixture<RegistroCatalogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroCatalogoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
