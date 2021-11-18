import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroTrasladoComponent } from './registro-traslado.component';

describe('RegistroTrasladoComponent', () => {
  let component: RegistroTrasladoComponent;
  let fixture: ComponentFixture<RegistroTrasladoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroTrasladoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroTrasladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
