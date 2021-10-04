import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposBienComponent } from './tipos-bien.component';

describe('TiposBienComponent', () => {
  let component: TiposBienComponent;
  let fixture: ComponentFixture<TiposBienComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TiposBienComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TiposBienComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
