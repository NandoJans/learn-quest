import { Component } from '@angular/core';
import {CustomDashboardComponent} from '../../../components/custom/custom-dashboard/custom-dashboard.component';
import {CustomDashboardConfig} from '../../../interfaces/custom/custom-dashboard-config';
import {CourseService} from '../../../services/entity/course.service';
import {SecurityService} from '../../../services/security/security.service';
import {CoursesComponent} from '../../user/courses/courses.component';
import {faBookOpen} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-teacher-dashboard',
  imports: [
    CustomDashboardComponent
  ],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent {
  constructor(
    private courseService: CourseService,
    private securityService: SecurityService
  ) {
  }

  getDashboardConfig(): CustomDashboardConfig {
    return {
      courses: {
        title: 'My Courses',
        icon: faBookOpen,
        description: 'Manage your courses, view progress, and access resources.',
        type: 'courses',
        component: CoursesComponent,
        color: '#4CAF50',
      }
    };
  }
}
