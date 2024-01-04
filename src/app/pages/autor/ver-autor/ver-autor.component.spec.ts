import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerAutorComponent } from './ver-autor.component';

describe('VerAutorComponent', () => {
  let component: VerAutorComponent;
  let fixture: ComponentFixture<VerAutorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerAutorComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerAutorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
