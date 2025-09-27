import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonRegistrationComponent } from './lesson-registration.component';

describe('LessonRegistrationComponent', () => {
  let component: LessonRegistrationComponent;
  let fixture: ComponentFixture<LessonRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonRegistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessonRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
