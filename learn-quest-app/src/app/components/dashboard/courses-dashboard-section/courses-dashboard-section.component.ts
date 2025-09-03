import {Component, Input} from '@angular/core';
import {CourseComponent} from '../../course/course.component';
import {NgForOf} from '@angular/common';
import {CourseService} from '../../../services/entity/course.service';
import {Course} from '../../../entities/course';
import {Button} from '../../../interfaces/button';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {RouteService} from '../../../services/core/route.service';

@Component({
  selector: 'app-courses-dashboard-section',
  imports: [
    CourseComponent,
    NgForOf,
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
    private routeService: RouteService
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

  navigate(routerLink: string) {
    this.routeService.navigateTo(routerLink);
  }
}
