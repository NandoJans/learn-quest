import { TestBed } from '@angular/core/testing';

import { LessonSectionService } from './lesson-section.service';

describe('LessonSectionService', () => {
  let service: LessonSectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LessonSectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
