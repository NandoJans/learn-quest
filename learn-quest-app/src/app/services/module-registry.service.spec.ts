import { TestBed } from '@angular/core/testing';

import { ModuleRegistryService } from './module-registry.service';

describe('ModuleRegistryService', () => {
  let service: ModuleRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModuleRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
