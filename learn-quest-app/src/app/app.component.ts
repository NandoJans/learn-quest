import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FaIconLibrary, FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import {RoleService} from './services/security/role.service';
import {AppRole} from './types/role';
import {SecurityService} from './services/security/security.service';
import {NavbarComponent} from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FontAwesomeModule, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'learn-quest-app';
  role: AppRole | null = null;

  constructor(
    library: FaIconLibrary,
    securityService: SecurityService,
    private roleService: RoleService,
  ) {
    securityService.load();
    library.addIconPacks(fas); // add all solid icons
  }

  ngOnInit() {
    this.roleService.activeRole$.subscribe(role => {
      this.role = role;
    });
  }
}
