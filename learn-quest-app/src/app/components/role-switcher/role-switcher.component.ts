import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';

import {FormsModule} from '@angular/forms';
import {RoleService} from '../../services/security/role.service';
import {AppRole} from '../../types/role';

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-switcher.component.html',
  styleUrls: ['./role-switcher.component.css']
})
export class RoleSwitcherComponent implements OnInit {
  roles: AppRole[] = [];
  active: AppRole | null = null;

  constructor(private roleService: RoleService) {
  }

  onChange(role: string) {
    this.roleService.setActiveRole(role as AppRole);
    this.roleService.redirectToRoleDashboard();
  }

  ngOnInit() {
    // Ensure the active role is set on initialization
    this.roleService.activeRole$.subscribe(role => {
      this.active = role;
      console.log('Active role changed:', role);
    });
    this.roleService.availableRoles$.subscribe(availableRoles => {
      this.roles = availableRoles;
    })
  }
}
