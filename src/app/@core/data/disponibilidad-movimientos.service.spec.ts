import { TestBed } from '@angular/core/testing';

import { DisponibilidadMovimientosService } from './disponibilidad-movimientos.service';

describe('DisponibilidadMovimientosService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DisponibilidadMovimientosService = TestBed.inject(DisponibilidadMovimientosService);
    expect(service).toBeTruthy();
  });
});
