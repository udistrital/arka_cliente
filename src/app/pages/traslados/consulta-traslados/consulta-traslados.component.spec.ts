import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaTrasladosComponent } from './consulta-traslados.component';

describe('ConsultaTrasladosComponent', () => {
  let component: ConsultaTrasladosComponent;
  let fixture: ComponentFixture<ConsultaTrasladosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaTrasladosComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaTrasladosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
