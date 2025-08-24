import {Component, OnInit} from '@angular/core';
import {CourseService} from '../../../services/entity/course.service';
import {NgForOf} from '@angular/common';
import {CourseComponent} from '../../../components/course/course.component';
import {Course} from '../../../entities/course';

@Component({
  selector: 'app-courses',
  imports: [
    NgForOf,
    CourseComponent
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {

  constructor(
    private courseService: CourseService,
  ) {}

  getCourses(): Course[] {
    return this.courseService.getCoursesByRole();
  }

  ngOnInit() {
    this.courseService.loadCourses();
  }

  getCourseRoute() {
    return '/user/course';
  }
}
