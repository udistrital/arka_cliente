/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListSubgrupo2Component } from './list-subgrupo_2.component';

describe('ListSubgrupo2Component', () => {
  let component: ListSubgrupo2Component;
  let fixture: ComponentFixture<ListSubgrupo2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListSubgrupo2Component ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListSubgrupo2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
