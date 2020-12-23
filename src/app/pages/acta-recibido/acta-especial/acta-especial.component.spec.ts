import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActaEspecialComponent } from './acta-especial.component';

describe('ActaEspecialComponent', () => {
  let component: ActaEspecialComponent;
  let fixture: ComponentFixture<ActaEspecialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActaEspecialComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActaEspecialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
