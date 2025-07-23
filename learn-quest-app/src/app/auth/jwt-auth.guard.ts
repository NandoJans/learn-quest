import {CanActivateFn, Router} from '@angular/router';
import { SecurityService } from '../services/security.service';
import {inject} from '@angular/core';

export const jwtAuthGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(SecurityService);
  const router = inject(Router);

  if (tokenService.isTokenExpired()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
