import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposEntradaComponent } from './tipos-entrada.component';

describe('TiposEntradaComponent', () => {
  let component: TiposEntradaComponent;
  let fixture: ComponentFixture<TiposEntradaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TiposEntradaComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TiposEntradaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
