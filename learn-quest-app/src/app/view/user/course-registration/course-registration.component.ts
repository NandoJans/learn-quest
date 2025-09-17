import {Component, Input, OnInit} from '@angular/core';
import {MathBasicComponent} from '../../../components/interactive/math-basic/math-basic.component';
import {NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {LessonRegistration} from '../../../entities/lesson-registration';
import {CourseRegistrationService} from '../../../services/entity/course-registration.service';
import {LessonRegistrationService} from '../../../services/entity/lesson-registration.service';
import {CourseRegistration} from '../../../entities/course-registration';

@Component({
  selector: 'app-course-registration',
  imports: [
    NgForOf,
    RouterLink
  ],
  templateUrl: './course-registration.component.html',
  styleUrl: './course-registration.component.css'
})
export class CourseRegistrationComponent implements OnInit {
  @Input() courseId: number = 0;
  courseRegistration: CourseRegistration | null = null;

  lessonRegistrations: LessonRegistration[] = [];

  constructor(
    private courseRegistrationService: CourseRegistrationService,
    private lessonRegistrationService: LessonRegistrationService,
  ) { }

  ngOnInit() {
    console.log(this.courseId);

    this.courseRegistrationService.loadSections({course: this.courseId}, (registrations) => {
      if (registrations.length > 0) {
        this.courseRegistration = registrations[0] as CourseRegistration;

        this.lessonRegistrationService.loadSections({courseRegistration: this.courseRegistration.id}, (registrations) => {
          this.lessonRegistrations = registrations as LessonRegistration[];
        });
      }
    });
  }
}
