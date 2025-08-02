import { TestBed } from '@angular/core/testing';

import { EntityCacheService } from './entity-cache.service';

describe('EntityCacheService', () => {
  let service: EntityCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntityCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
