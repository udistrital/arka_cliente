import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaElementosAgregadosComponent } from './tabla-elementos-agregados.component';

describe('TablaElementosAgregadosComponent', () => {
  let component: TablaElementosAgregadosComponent;
  let fixture: ComponentFixture<TablaElementosAgregadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TablaElementosAgregadosComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablaElementosAgregadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
