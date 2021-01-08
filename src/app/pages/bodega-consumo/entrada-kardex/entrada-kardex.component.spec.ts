import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntradaKardexComponent } from './entrada-kardex.component';

describe('EntradaKardexComponent', () => {
  let component: EntradaKardexComponent;
  let fixture: ComponentFixture<EntradaKardexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntradaKardexComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntradaKardexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
