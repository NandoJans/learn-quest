import {Component, Input, OnInit} from '@angular/core';
import {LessonRegistrationService} from '../../../services/entity/lesson-registration.service';
import {LessonRegistration} from '../../../entities/lesson-registration';
import {Lesson} from '../../../entities/lesson';
import {LessonSection} from '../../../entities/lesson-section';
import { LessonSectionService } from '../../../services/entity/lesson-section.service';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-lesson-registration',
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './lesson-registration.component.html',
  styleUrl: './lesson-registration.component.css'
})
export class LessonRegistrationComponent implements OnInit {
  @Input() lessonRegistrationId: number = 0;
  lessonRegistration: LessonRegistration = new LessonRegistration();
  lessonSections: LessonSection[] = [];
  constructor(
    private lessonRegistrationService: LessonRegistrationService,
    private lessonSectionService: LessonSectionService
  ) { }

  ngOnInit() {
    this.lessonRegistrationService.loadSections({id: this.lessonRegistrationId}, (registrations) => {
      if (registrations.length > 0) {
        this.lessonRegistration = registrations[0] as LessonRegistration;

        this.lessonSectionService.loadSections({lesson: this.lessonRegistration.lesson.id}, (sections) => {
          this.lessonSections = sections as LessonSection[];
        });
      }
    });
  }

  getLesson(): Lesson {
    return this.lessonRegistration.lesson;
  }
}
