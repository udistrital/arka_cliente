import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudTrasladoComponent } from './crud-traslado.component';

describe('CrudTrasladoComponent', () => {
  let component: CrudTrasladoComponent;
  let fixture: ComponentFixture<CrudTrasladoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudTrasladoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudTrasladoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
