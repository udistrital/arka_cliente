import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AperturaKardexComponent } from './apertura-kardex.component';

describe('AperturaKardexComponent', () => {
  let component: AperturaKardexComponent;
  let fixture: ComponentFixture<AperturaKardexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AperturaKardexComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AperturaKardexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
