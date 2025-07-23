import { Routes } from '@angular/router';
import {LoginComponent} from './view/authentication/login/login.component';
import {DashboardComponent} from './view/dashboard/dashboard.component';
import {jwtAuthGuard} from './auth/jwt-auth.guard';

export const routes: Routes = [
  {component: LoginComponent, path: '', title: 'Login'},
  {component: LoginComponent, path: 'login', title: 'Login'},
  {component: DashboardComponent, path: 'user/dashboard', title: 'Dashboard', canActivate: [jwtAuthGuard]},
];
