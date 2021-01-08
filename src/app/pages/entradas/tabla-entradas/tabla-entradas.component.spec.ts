import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaEntradasComponent } from './tabla-entradas.component';

describe('TablaEntradasComponent', () => {
  let component: TablaEntradasComponent;
  let fixture: ComponentFixture<TablaEntradasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TablaEntradasComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablaEntradasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
