import {CanActivateFn, Router, UrlTree} from '@angular/router';
import {inject} from '@angular/core';
import {RoleService} from '../services/security/role.service';
import { SecurityService } from '../services/security/security.service';
import {AppRole} from '../types/role';
import {combineLatest, map, take} from 'rxjs';
import {filter} from 'rxjs/operators';

export const roleGuard: CanActivateFn = (route, state) => {
  const roles = inject(RoleService);
  const security = inject(SecurityService);
  const router = inject(Router);

  // Ensure auth state is loaded (sets roles from JWT if present)
  security.load();

  const required = route.data?.['role'] as AppRole | AppRole[] | undefined;
  const requiredList: AppRole[] = required
    ? (Array.isArray(required) ? required : [required])
    : [];

  // Wait until we have the available roles (after load()).
  return combineLatest([roles.availableRoles$, roles.activeRole$]).pipe(
    // ensure roles are known (or empty array if truly none)
    filter(([available]) => Array.isArray(available)),
    take(1),
    map(([available, active]) => {
      // If active role not set but user has roles, default to the first one
      if (!active && available.length) {
        roles.setActiveRole(available[0], false);
        active = available[0];
      }

      // If no specific role required, allow
      if (!requiredList.length) return true;

      // Allow if active matches any required role
      if (active && requiredList.includes(active)) return true;

      // Otherwise, redirect to the dashboard of the *current* (or first) role if possible,
      // or fallback to login
      const targetRole = active ?? available[0] ?? null;
      if (targetRole) {
        roles.setActiveRole(targetRole, false);
        roles.redirectToRoleDashboard();
        return false as unknown as UrlTree; // returning false is fine; redirect done above
      }
      return router.createUrlTree(['/login']);
    })
  );
};
