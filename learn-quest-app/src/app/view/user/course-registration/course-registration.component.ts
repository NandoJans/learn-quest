import {Component, Input, OnInit} from '@angular/core';
import {NgForOf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {LessonRegistration} from '../../../entities/lesson-registration';
import {CourseRegistrationService} from '../../../services/entity/course-registration.service';
import {LessonRegistrationService} from '../../../services/entity/lesson-registration.service';
import {CourseRegistration} from '../../../entities/course-registration';
import {IconComponent} from '../../../components/icon/icon.component';
import {Course} from '../../../entities/course';
import {SideButtonComponent} from '../../../components/buttons/side-button/side-button.component';
import {faArrowRight} from '@fortawesome/free-solid-svg-icons';
import {RouteService} from '../../../services/core/route.service';

@Component({
  selector: 'app-course-registration',
  imports: [
    NgForOf,
    RouterLink,
    IconComponent,
    SideButtonComponent
  ],
  templateUrl: './course-registration.component.html',
  styleUrl: './course-registration.component.css'
})
export class CourseRegistrationComponent implements OnInit {
  @Input() courseId: number = 0;
  courseRegistration: CourseRegistration = new CourseRegistration();

  lessonRegistrations: LessonRegistration[] = [];

  constructor(
    private courseRegistrationService: CourseRegistrationService,
    private lessonRegistrationService: LessonRegistrationService,
    private routeService: RouteService
  ) { }

  ngOnInit() {
    this.courseRegistrationService.loadSections({course: this.courseId}, (registrations) => {
      if (registrations.length > 0) {
        this.courseRegistration = registrations[0] as CourseRegistration;

        this.lessonRegistrationService.loadSections({courseRegistration: this.courseRegistration.id}, (registrations) => {
          this.lessonRegistrations = registrations as LessonRegistration[];
        });
      }
    });
  }

  getCourse(): Course {
    return this.courseRegistration.course
  }

  protected readonly faArrowRight = faArrowRight;

  navigateToLesson(id: number) {
    this.routeService.navigateTo(['lessonRegistration'], {lessonRegistrationId: id});
  }
}
