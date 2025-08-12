import {CanActivateFn, Router} from '@angular/router';
import { SecurityService } from '../services/security.service';
import {inject} from '@angular/core';
import { RoleService } from '../services/role.service';

export const jwtAuthGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(SecurityService);
  const roleService = inject(RoleService);
  const router = inject(Router);

  if (tokenService.isTokenExpired()) {
    roleService.logout();
    tokenService.logout();
    router.navigate(['/login']);
    return false;
  }
  return true;
};
