import { TestBed } from '@angular/core/testing';
import { EntityCacheService } from './entity-cache.service';

describe('EntityCacheService', () => {
  let service: EntityCacheService<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject<EntityCacheService<any>>(EntityCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
