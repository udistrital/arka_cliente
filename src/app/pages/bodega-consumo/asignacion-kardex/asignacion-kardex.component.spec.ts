import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionKardexComponent } from './asignacion-kardex.component';

describe('AsignacionKardexComponent', () => {
  let component: AsignacionKardexComponent;
  let fixture: ComponentFixture<AsignacionKardexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsignacionKardexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignacionKardexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
