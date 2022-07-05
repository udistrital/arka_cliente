import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudCuentasComponent } from './crud-cuentas.component';

describe('CrudCuentasComponent', () => {
  let component: CrudCuentasComponent;
  let fixture: ComponentFixture<CrudCuentasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudCuentasComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudCuentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
