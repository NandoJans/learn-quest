import {Component, OnInit} from '@angular/core';
import {RoleSwitcherComponent} from "../role-switcher/role-switcher.component";
import {SecurityService} from '../../services/security.service';
import {Router} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {RoleDashboardRoute, RoleService} from '../../services/role.service';

@Component({
  selector: 'app-navbar',
  imports: [
    RoleSwitcherComponent,
    NgForOf,
    NgIf
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  routes: RoleDashboardRoute[] = [];

  constructor(
    private securityService: SecurityService,
    private roleService: RoleService,
    private router: Router
  ) {}

  logout() {
    this.securityService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    // Initialize routes from the app's routing configuration
    this.roleService.activeRole$.subscribe(role => {
      this.routes = this.roleService.getRoutesForRole(role);
    })
  }

  isLoggedIn() {
    return !this.securityService.isTokenExpired();
  }
}
