import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RespuestaSolicitudesComponent } from './respuesta-solicitudes.component';

describe('RespuestaSolicitudesComponent', () => {
  let component: RespuestaSolicitudesComponent;
  let fixture: ComponentFixture<RespuestaSolicitudesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RespuestaSolicitudesComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RespuestaSolicitudesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
