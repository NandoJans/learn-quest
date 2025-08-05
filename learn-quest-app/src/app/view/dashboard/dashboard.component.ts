import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {SecurityService} from '../../services/security.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  constructor(
    private router: Router,
    private securityService: SecurityService,
  ) { }

  logout() {
    this.securityService.logout();
    this.router.navigate(['/login']);
  }
}
