import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CourseService} from '../../../services/course.service';
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
export class CoursesComponent {

  constructor(
    private router: Router,
    private courseService: CourseService,
  ) { }

  getCourses(): Course[] {
    return this.courseService.getCourses();
  }
}
