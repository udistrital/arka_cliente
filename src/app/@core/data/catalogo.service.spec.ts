import { TestBed } from '@angular/core/testing';

import { CatalogoService } from './catalogo.service';

describe('CatalogoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CatalogoService = TestBed.inject(CatalogoService);
    expect(service).toBeTruthy();
  });
});
