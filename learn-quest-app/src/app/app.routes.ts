import { Routes } from '@angular/router';
import {LoginComponent} from './view/authentication/login/login.component';

export const routes: Routes = [
  {component: LoginComponent, path: '', title: 'Login'},
  {component: LoginComponent, path: 'login', title: 'Login'},
];
