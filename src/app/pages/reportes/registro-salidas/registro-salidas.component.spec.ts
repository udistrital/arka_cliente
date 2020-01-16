import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroSalidasComponent } from './registro-salidas.component';

describe('RegistroSalidasComponent', () => {
  let component: RegistroSalidasComponent;
  let fixture: ComponentFixture<RegistroSalidasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroSalidasComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroSalidasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
