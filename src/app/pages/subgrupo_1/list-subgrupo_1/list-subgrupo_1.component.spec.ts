/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ListSubgrupo1Component } from './list-subgrupo_1.component';

describe('ListSubgrupo1Component', () => {
  let component: ListSubgrupo1Component;
  let fixture: ComponentFixture<ListSubgrupo1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListSubgrupo1Component ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListSubgrupo1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
