import { TestBed } from '@angular/core/testing';

import { LessonRegistrationService } from './lesson-registration.service';

describe('LessonRegistrationService', () => {
  let service: LessonRegistrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LessonRegistrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
