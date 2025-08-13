import { Component, OnInit } from '@angular/core';
import { RoleSwitcherComponent } from "../role-switcher/role-switcher.component";
import { SecurityService } from '../../services/security/security.service';
import { Router, RouterLink } from '@angular/router';
import { NgForOf, NgIf } from '@angular/common';
import { RoleDashboardRoute, RoleService } from '../../services/security/role.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RoleSwitcherComponent, NgForOf, NgIf, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  routes: RoleDashboardRoute[] = [];
  menuOpen = false;

  constructor(
    private securityService: SecurityService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit() {
    this.roleService.activeRole$.subscribe(role => {
      this.routes = this.roleService.getRoutesForRole(role);
      this.menuOpen = false; // close menu when role changes
    });
  }

  isLoggedIn() { return !this.securityService.isTokenExpired(); }

  logout() {
    this.securityService.logout();
    this.router.navigate(['/login']);
  }

  toggleMenu() { this.menuOpen = !this.menuOpen; }
  closeMenu()  { this.menuOpen = false; }
}
