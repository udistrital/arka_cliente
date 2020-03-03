import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudBajasComponent } from './solicitud-bajas.component';

describe('SolicitudBajasComponent', () => {
  let component: SolicitudBajasComponent;
  let fixture: ComponentFixture<SolicitudBajasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitudBajasComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudBajasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
