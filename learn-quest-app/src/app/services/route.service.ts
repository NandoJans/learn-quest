import { Injectable } from '@angular/core';
import {AppRole} from '../types/role';
import { RoleService } from './role.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  role: AppRole | null = null;

  roleRouteBases: Record<AppRole, string> = {
    ROLE_ADMIN: 'admin',
    ROLE_USER: 'user',
    ROLE_TEACHER: 'teacher',
  };

  constructor(
    private roleService: RoleService,
    private router: Router,
  ) {
    this.roleService.activeRole$.subscribe(role => {
      this.role = role;
    });
  }

  getRoleRouteBase(): string {
    if (!this.role) return '';
    return this.roleRouteBases[this.role] || '';
  }

  navigateToModule(slug: string) {
    this.router.navigate([this.getRoleRouteBase(), 'module', slug]);
  }

  navigateTo(path: string) {
    this.router.navigate([this.getRoleRouteBase(), path]);
  }
}
