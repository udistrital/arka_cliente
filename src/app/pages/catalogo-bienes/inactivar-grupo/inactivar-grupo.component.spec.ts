import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InactivarGrupoComponent } from './inactivar-grupo.component';

describe('InactivarGrupoComponent', () => {
  let component: InactivarGrupoComponent;
  let fixture: ComponentFixture<InactivarGrupoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InactivarGrupoComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InactivarGrupoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
