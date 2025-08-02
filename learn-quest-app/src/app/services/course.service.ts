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
  ) {}

  getCourses() {
    return this.courses;
  }

  loadCourses(params: object = {}) {
    this.apiService.get<Course>('course/index', params).subscribe({
      next: (data: any) => {
        this.courses = this.entityService.matchDataToEntity<Course>(data, Course);
      },
      error: (error: any) => {
        console.error('Error loading courses:', error);
      }
    });
  }
}
