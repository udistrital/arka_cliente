import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaElementosAsignadosComponent } from './tabla-elementos-asignados.component';

describe('TablaElementosAsignadosComponent', () => {
  let component: TablaElementosAsignadosComponent;
  let fixture: ComponentFixture<TablaElementosAsignadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TablaElementosAsignadosComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablaElementosAsignadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
