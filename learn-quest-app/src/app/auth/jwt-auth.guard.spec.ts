import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { jwtAuthGuard } from './jwt-auth.guard';

describe('jwtAuthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => jwtAuthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
