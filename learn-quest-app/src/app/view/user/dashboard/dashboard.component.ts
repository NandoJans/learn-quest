import {Component, OnInit} from '@angular/core';
import {CourseComponent} from '../../../components/course/course.component';
import {NgForOf} from '@angular/common';
import {CourseService} from '../../../services/entity/course.service';

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
    private courseService: CourseService
  ) { }

  getEnrolledCourses(): any {
    return this.courseService.getEnrolledCourses();
  }

  ngOnInit() {
    // Load enrolled courses when the component initializes
    this.courseService.loadEnrolledCourses();
  }

  getCourseRoute() {
    return '/user/courseRegistration/';
  }
}
