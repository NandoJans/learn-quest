import { Routes } from '@angular/router';
import {LoginComponent} from './view/authentication/login/login.component';
import {DashboardComponent} from './view/user/dashboard/dashboard.component';
import {jwtAuthGuard} from './auth/jwt-auth.guard';
import {CoursesComponent} from './view/user/courses/courses.component';
import {LessonsComponent} from './view/user/lessons/lessons.component';
import {LessonSectionCreateComponent} from './view/teacher/lesson-section-create/lesson-section-create.component';
import {CourseRegistrationComponent} from './view/user/course-registration/course-registration.component';
import {TeacherDashboardComponent} from './view/teacher/teacher-dashboard/teacher-dashboard.component';
import {
  InteractiveWidgetLibraryComponent
} from './view/user/interactive-widget-library/interactive-widget-library.component';
import {roleMatchGuard} from './auth/role-match.guard';
import {InteractiveWidgetComponent} from './view/user/interactive-widget/interactive-widget.component';
import {CreateCourseComponent} from './view/teacher/course/create-course/create-course.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },

  {
    path: 'user',
    canMatch: [jwtAuthGuard, roleMatchGuard('ROLE_USER')],
    children: [
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },
      { path: 'courses', component: CoursesComponent, title: 'Courses' },
      { path: 'course', component: LessonsComponent, title: 'Course' },
      { path: 'modules', component: InteractiveWidgetLibraryComponent, title: 'IWL' },
      { path: 'module/:slug', component: InteractiveWidgetComponent, title: 'IWL' },
      { path: 'courseRegistration', component: CourseRegistrationComponent, title: 'Course' },
    ]
  },
  {
    path: 'teacher',
    canMatch: [jwtAuthGuard, roleMatchGuard('ROLE_TEACHER')],
    children: [
      { path: 'dashboard', component: TeacherDashboardComponent, title: 'Dashboard' },
      { path: 'courses', component: CoursesComponent, title: 'Courses' },
      { path: 'lesson/:lessonId/sections', component: LessonSectionCreateComponent, title: 'Edit Lesson Sections' },
      { path: 'course/create', component: CreateCourseComponent, title: 'Create Course' },
    ]
  },
  {
    path: 'admin',
    canMatch: [jwtAuthGuard, roleMatchGuard('ROLE_ADMIN')],
    children: [
      // { path: 'dashboard', component: AdminDashboardComponent, title: 'Admin' },
    ]
  },
];
