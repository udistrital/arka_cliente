import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudBajasComponent } from './crud-bajas.component';

describe('CrudBajasComponent', () => {
  let component: CrudBajasComponent;
  let fixture: ComponentFixture<CrudBajasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrudBajasComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudBajasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
