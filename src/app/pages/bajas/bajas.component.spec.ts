import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BajasComponent } from './bajas.component';

describe('BajasComponent', () => {
  let component: BajasComponent;
  let fixture: ComponentFixture<BajasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BajasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BajasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
