import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobacionBajasComponent } from './aprobacion-bajas.component';

describe('AprobacionBajasComponent', () => {
  let component: AprobacionBajasComponent;
  let fixture: ComponentFixture<AprobacionBajasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AprobacionBajasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AprobacionBajasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
