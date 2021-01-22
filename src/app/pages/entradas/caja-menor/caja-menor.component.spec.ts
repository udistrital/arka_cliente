import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaMenorComponent } from './caja-menor.component';

describe('CajaMenorComponent', () => {
  let component: CajaMenorComponent;
  let fixture: ComponentFixture<CajaMenorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CajaMenorComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CajaMenorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
