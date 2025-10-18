import { Component } from '@angular/core';
import {CustomDashboardComponent} from '../../../components/custom/custom-dashboard/custom-dashboard.component';
import {CustomDashboardConfig} from '../../../interfaces/custom/custom-dashboard-config';
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
        styleColor: '3',
        inputs: {
          courseRouterLink: 'course',
          bottomButtons: [
            {
              icon: faBars,
              routerLink: ['courses'],
              buttonClass: 'btn-black'
            },
            {
              icon: faPlus,
              routerLink: ['course', 'create'],
              buttonClass: 'btn-black',
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
        styleColor: '3',
      }
    };
  }
}
