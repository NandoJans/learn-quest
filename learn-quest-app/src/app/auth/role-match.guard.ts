import {CanMatchFn, Route, Router, UrlSegment} from '@angular/router';
import {AppRole} from '../types/role';
import {inject} from '@angular/core';
import {RoleService} from '../services/security/role.service';
import {SecurityService} from '../services/security/security.service';

export const roleMatchGuard  = (required: AppRole): CanMatchFn => {
  return (_route: Route, _segments: UrlSegment[]) => {
    const roles = inject(RoleService);
    const security = inject(SecurityService);
    const router = inject(Router);

    security.load();
    const active: AppRole | null = roles.activeRole;
    let available: AppRole[] = roles.availableRoles;

    if (typeof available === 'object') {
      available = Object.values(available);
    }

    // If user has required role but isn’t acting as it, switch silently.
    if (!active && available.includes(required)) {
      roles.setActiveRole(required);
      return true;
    }
    if (active === required) return true;

    // If user has it, switch; else kick to login.
    if (available.includes(required)) {
      roles.setActiveRole(required);
      return true;
    }
    return router.createUrlTree(['/login']);
  };
};
