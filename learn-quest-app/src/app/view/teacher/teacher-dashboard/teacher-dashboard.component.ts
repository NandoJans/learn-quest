import { Component } from '@angular/core';
import {CustomDashboardComponent} from '../../../components/custom/custom-dashboard/custom-dashboard.component';
import {CustomDashboardConfig} from '../../../interfaces/custom/custom-dashboard-config';
import {CourseService} from '../../../services/entity/course.service';
import {SecurityService} from '../../../services/security/security.service';
import {faBars, faBookOpen, faPlus} from '@fortawesome/free-solid-svg-icons';
import {
  CoursesDashboardSectionComponent
} from '../../../components/dashboard/courses-dashboard-section/courses-dashboard-section.component';
import {
  StudentsDashboardSectionComponent
} from '../../../components/dashboard/students-dashboard-section/students-dashboard-section.component';

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
  ) {
  }

  getDashboardConfig(): CustomDashboardConfig {
    return {
      courses: {
        title: 'My Courses',
        icon: faBookOpen,
        description: 'Manage your courses, view progress, and access resources.',
        type: 'courses',
        component: CoursesDashboardSectionComponent,
        color: '#4CAF50',
        inputs: {
          courseRouterLink: '/teacher/course',
          bottomButtons: [
            {
              icon: faBars,
              routerLink: '/teacher/courses',
              buttonClass: 'btn-3'
            },
            {
              icon: faPlus,
              routerLink: '/teacher/course/create',
              buttonClass: 'btn-2',
            }
          ]
        }
      },
      students: {
        title: 'My Students',
        icon: faBookOpen,
        description: 'View and manage your students, track their progress, and provide feedback.',
        type: 'students',
        component: StudentsDashboardSectionComponent,
        color: '#2196F3',
      }
    };
  }
}
