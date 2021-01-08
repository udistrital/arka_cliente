import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelacionCatalogoComponent } from './relacion-catalogo.component';

describe('RelacionCatalogoComponent', () => {
  let component: RelacionCatalogoComponent;
  let fixture: ComponentFixture<RelacionCatalogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelacionCatalogoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelacionCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
