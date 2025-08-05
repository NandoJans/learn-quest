import {Injectable} from '@angular/core';
import {Course} from '../entities/course';
import {EntityCacheService} from './entity-cache.service';
import {Observable} from 'rxjs';
import {ApiService} from './api.service';
import {SecurityService} from './security.service';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(
    private cacheService: EntityCacheService<Course>,
    private apiService: ApiService,
    private securityService: SecurityService
  ) {}

  loadCourses(params: {[key: string]: any} = {}, forceReload = false): void {
    this.cacheService.loadEntities('course/index', Course, params, forceReload);
  }

  getCourses(params: {[key: string]: any} = {}): Course[] {
    return this.cacheService.filterCachedEntities(Course, params);
  }

  clearCache() {
    this.cacheService.clearCache();
  }

  enrollInCourse(courseId: number): Observable<any> {
    const userId = this.securityService.getUser()?.id;
    if (!userId) {
      throw new Error('User must be logged in to enroll in a course');
    }
    const body = {
      course_id: courseId,
      user_id: userId
    }
    return this.apiService.post<any>(`course/enroll`, body);
  }
}
