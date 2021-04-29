import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvaluoComponent } from './avaluo.component';

describe('AvaluoComponent', () => {
  let component: AvaluoComponent;
  let fixture: ComponentFixture<AvaluoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvaluoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvaluoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
