import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppRole } from '../types/role';
import { Router } from '@angular/router';

const LS_KEY = 'activeRole';

@Injectable({ providedIn: 'root' })
export class RoleService {
  /** All roles granted to the logged-in user (populate from your auth flow/JWT) */
  private _availableRoles$ = new BehaviorSubject<AppRole[]>([]);
  availableRoles$ = this._availableRoles$.asObservable();

  /** The currently acting role */
  private _activeRole$ = new BehaviorSubject<AppRole | null>(null);
  activeRole$ = this._activeRole$.asObservable();

  private readonly roleRoutes: Record<AppRole, string> = {
    ROLE_ADMIN: '/admin/dashboard',
    ROLE_TEACHER: '/teacher/dashboard',
    ROLE_USER: '/user/dashboard'
  };

  constructor(
    private router: Router,
  ) {
  }

  init(roles: AppRole[], preferred?: AppRole) {
    this._availableRoles$.next(roles);

    // preferred > localStorage > first role
    const stored = (localStorage.getItem(LS_KEY) || '') as AppRole;
    const initial =
      (preferred && roles.includes(preferred) && preferred) ||
      (stored && roles.includes(stored) && stored) ||
      roles[0] || null;

    this.setActiveRole(initial || null, false);
  }

  setActiveRole(role: AppRole | null, persist = true) {
    const currentRoles = this._availableRoles$.value;
    if (role && !currentRoles.includes(role)) return; // ignore invalid
    this._activeRole$.next(role);
    if (persist && role) localStorage.setItem(LS_KEY, role);
  }

  get activeRole(): AppRole | null { return this._activeRole$.value; }
  get availableRoles(): AppRole[] { return this._availableRoles$.value; }

  /** Simple helpers */
  is(role: AppRole) { return this._activeRole$.value === role; }
  has(role: AppRole) { return this._availableRoles$.value.includes(role); }

  redirectToRoleDashboard() {
    const role = this.activeRole;
    if (role && this.roleRoutes[role]) {
      this.router.navigate([this.roleRoutes[role]]);
    }
  }
}
