import { TestBed } from '@angular/core/testing';

import { InteractiveWidgetService } from './interactive-widget.service';

describe('InteractiveWidgetService', () => {
  let service: InteractiveWidgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InteractiveWidgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
