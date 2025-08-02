import { Routes } from '@angular/router';
import {LoginComponent} from './view/authentication/login/login.component';
import {DashboardComponent} from './view/dashboard/dashboard.component';
import {jwtAuthGuard} from './auth/jwt-auth.guard';
import {CoursesComponent} from './view/user/courses/courses.component';
import {LessonsComponent} from './view/user/lessons/lessons.component';

export const routes: Routes = [
  {component: LoginComponent, path: '', title: 'Login'},
  {component: LoginComponent, path: 'login', title: 'Login'},
  {component: DashboardComponent, path: 'user/dashboard', title: 'Dashboard', canActivate: [jwtAuthGuard]},
  {component: CoursesComponent, path: 'user/courses', title: 'Courses', canActivate: [jwtAuthGuard]},
  {component: LessonsComponent, path: 'user/course', title: 'Course', canActivate: [jwtAuthGuard]},
];
