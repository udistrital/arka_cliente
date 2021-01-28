import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntangiblesDesarrolladosComponent } from './intangibles-desarrollados.component';

describe('IntangiblesDesarrolladosComponent', () => {
  let component: IntangiblesDesarrolladosComponent;
  let fixture: ComponentFixture<IntangiblesDesarrolladosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntangiblesDesarrolladosComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntangiblesDesarrolladosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
