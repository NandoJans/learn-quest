import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {FormsModule} from '@angular/forms';
import {RoleService} from '../../services/role.service';
import {AppRole} from '../../types/role';

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-switcher.component.html',
  styleUrls: ['./role-switcher.component.css']
})
export class RoleSwitcherComponent {
  roles;
  active;

  constructor(private roleService: RoleService) {
    this.roles = roleService.availableRoles$;
    this.active = roleService.activeRole$;
  }

  onChange(role: string) {
    this.roleService.setActiveRole(role as AppRole);
    this.roleService.redirectToRoleDashboard();
  }
}
