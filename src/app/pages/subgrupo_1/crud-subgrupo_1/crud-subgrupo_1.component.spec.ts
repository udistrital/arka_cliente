/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CrudSubgrupo1Component } from './crud-subgrupo_1.component';

describe('CrudSubgrupo1Component', () => {
  let component: CrudSubgrupo1Component;
  let fixture: ComponentFixture<CrudSubgrupo1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudSubgrupo1Component ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudSubgrupo1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
