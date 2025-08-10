import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SecurityService} from '../../services/security.service';
import {CourseComponent} from '../../components/course/course.component';
import {NgForOf} from '@angular/common';
import {CourseService} from '../../services/course.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CourseComponent,
    NgForOf
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private securityService: SecurityService,
    private courseService: CourseService
  ) { }

  getEnrolledCourses(): any {
    return this.courseService.getEnrolledCourses();
  }

  logout() {
    this.securityService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    // Load enrolled courses when the component initializes
    this.courseService.loadEnrolledCourses();
  }

  getCourseRoute() {
    return '/user/courseRegistration/';
  }
}
