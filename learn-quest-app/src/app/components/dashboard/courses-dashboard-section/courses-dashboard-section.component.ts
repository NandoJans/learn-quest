import {Component, Input} from '@angular/core';
import {CourseComponent} from '../../course/course.component';
import {NgForOf} from '@angular/common';
import {CourseService} from '../../../services/entity/course.service';
import {Course} from '../../../entities/course';
import {RouterLink} from '@angular/router';
import {Button} from '../../../interfaces/button';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-courses-dashboard-section',
  imports: [
    CourseComponent,
    NgForOf,
    RouterLink,
    FaIconComponent
  ],
  templateUrl: './courses-dashboard-section.component.html',
  styleUrl: './courses-dashboard-section.component.css'
})
export class CoursesDashboardSectionComponent {
  @Input() courseRouterLink: string = '';
  @Input() bottomButtons: Button[] = [];

  constructor(
    private courseService: CourseService,
  ) {

  }

  getCourses(): Course[] {
    return this.courseService.getCoursesByRole()
  }

  getBottomButtons(): Button[] {
    return this.bottomButtons;
  }

  getCourseRoute() {
    return this.courseRouterLink;
  }
}
