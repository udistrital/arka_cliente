/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CrudSubgrupo2Component } from './crud-subgrupo_2.component';

describe('CrudSubgrupo2Component', () => {
  let component: CrudSubgrupo2Component;
  let fixture: ComponentFixture<CrudSubgrupo2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudSubgrupo2Component ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudSubgrupo2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
