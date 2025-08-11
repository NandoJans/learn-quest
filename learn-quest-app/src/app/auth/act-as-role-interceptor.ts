import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { RoleService } from '../services/role.service';

export const actAsRoleInterceptor: HttpInterceptorFn = (req, next) => {
  // optionally skip certain endpoints (e.g., login)
  if (req.url.includes('/api/login')) {
    return next(req);
  }

  const roleService = inject(RoleService);
  const role = roleService.activeRole;

  if (!role) {
    return next(req);
  }

  // Merge header without clobbering others
  const cloned = req.clone({
    setHeaders: {
      'X-Act-As-Role': role
    }
  });

  return next(cloned);
};
