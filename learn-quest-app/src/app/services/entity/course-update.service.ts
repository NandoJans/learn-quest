import { Injectable } from '@angular/core';
import { CourseService } from './course.service';
import { Observable, tap } from 'rxjs';
import { Course } from '../../entities/course';

@Injectable({ providedIn: 'root' })
export class CourseUpdateService {
  constructor(private courseService: CourseService) {}

  patch(courseId: number, data: Partial<Course>): Observable<Course> {
    return this.courseService
      .updateCourse(courseId, data as { [key: string]: any })
      .pipe(tap(() => this.courseService.loadCourses({ id: courseId }, true)));
  }
}
