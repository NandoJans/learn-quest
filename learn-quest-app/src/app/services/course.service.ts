import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {Course} from '../entities/course';
import {EntityService} from './entity.service';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  courses: Course[] = [];

  constructor(
    private apiService: ApiService,
    private entityService: EntityService
  ) {
    this.loadCourses();
  }

  getCourses() {
    return this.courses;
  }

  private loadCourses() {
    this.apiService.get<object>('course/index').subscribe({
      next: (data: any) => {
        this.courses = this.entityService.matchDataToEntity<Course>(data, Course);
      },
      error: (error: any) => {
        console.error('Error loading courses:', error);
      }
    });
  }
}
