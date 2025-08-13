import { TestBed } from '@angular/core/testing';

import { ModuleConfigService } from './module-config.service';

describe('ModuleConfigService', () => {
  let service: ModuleConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModuleConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
