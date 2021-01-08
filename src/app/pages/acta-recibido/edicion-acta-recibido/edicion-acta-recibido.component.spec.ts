import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EdicionActaRecibidoComponent } from './edicion-acta-recibido.component';

describe('EdicionActaRecibidoComponent', () => {
  let component: EdicionActaRecibidoComponent;
  let fixture: ComponentFixture<EdicionActaRecibidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EdicionActaRecibidoComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EdicionActaRecibidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
