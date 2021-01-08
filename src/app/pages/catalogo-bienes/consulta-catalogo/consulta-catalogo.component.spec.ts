import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaCatalogoComponent } from './consulta-catalogo.component';

describe('ConsultaCatalogoComponent', () => {
  let component: ConsultaCatalogoComponent;
  let fixture: ComponentFixture<ConsultaCatalogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaCatalogoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
