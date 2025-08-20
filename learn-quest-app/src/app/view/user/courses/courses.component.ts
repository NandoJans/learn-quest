import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CourseService} from '../../../services/entity/course.service';
import {NgForOf} from '@angular/common';
import {CourseComponent} from '../../../components/course/course.component';
import {Course} from '../../../entities/course';
import {RoleService} from '../../../services/security/role.service';
import {SecurityService} from '../../../services/security/security.service';

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
    private router: Router,
    private courseService: CourseService,
    private roleService: RoleService,
    private securityService: SecurityService
  ) {}

  getCourses(): Course[] {
    switch (this.roleService.activeRole) {
      case "ROLE_USER":
        return this.courseService.getCourses({
          'courseRegistrations.user': this.securityService.getUser()?.id,
        });
      case "ROLE_ADMIN":
        return this.courseService.getCourses();
      case "ROLE_TEACHER":
        return this.courseService.getCourses({
          // user: this.securityService.getUser()?.id,
        });
    }
    return [];
  }

  ngOnInit() {
    this.courseService.loadCourses();
  }

  getCourseRoute() {
    return '/user/course';
  }
}
