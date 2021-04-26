import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaBienesComponent } from './lista-bienes.component';

describe('ListaBienesComponent', () => {
  let component: ListaBienesComponent;
  let fixture: ComponentFixture<ListaBienesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaBienesComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaBienesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
