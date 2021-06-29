import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdicionesMejorasComponent } from './adiciones-mejoras.component';

describe('AdicionesMejorasComponent', () => {
  let component: AdicionesMejorasComponent;
  let fixture: ComponentFixture<AdicionesMejorasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdicionesMejorasComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdicionesMejorasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
