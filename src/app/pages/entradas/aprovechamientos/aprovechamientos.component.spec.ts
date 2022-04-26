import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AprovechamientosComponent } from './aprovechamientos.component';

describe('AprovechamientosComponent', () => {
  let component: AprovechamientosComponent;
  let fixture: ComponentFixture<AprovechamientosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AprovechamientosComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AprovechamientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
