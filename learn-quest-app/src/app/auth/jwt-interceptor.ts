// src/app/auth/jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import {inject} from '@angular/core';
import {SecurityService} from '../services/security.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/api/login')) {
    return next(req);
  }

  const tokenService = inject(SecurityService);

  if (tokenService.isTokenExpired()) {

    return next(req);
  }

  const token = tokenService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
