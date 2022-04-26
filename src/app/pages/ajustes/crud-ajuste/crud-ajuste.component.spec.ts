import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudAjusteComponent } from './crud-ajuste.component';

describe('CrudAjusteComponent', () => {
  let component: CrudAjusteComponent;
  let fixture: ComponentFixture<CrudAjusteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudAjusteComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudAjusteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
