import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntangiblesAdquiridosComponent } from './intangibles-adquiridos.component';

describe('IntangiblesAdquiridosComponent', () => {
  let component: IntangiblesAdquiridosComponent;
  let fixture: ComponentFixture<IntangiblesAdquiridosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntangiblesAdquiridosComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntangiblesAdquiridosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
