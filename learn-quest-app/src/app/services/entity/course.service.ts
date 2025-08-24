import {Injectable} from '@angular/core';
import {Course} from '../../entities/course';
import {EntityCacheService} from './entity-cache.service';
import {Observable} from 'rxjs';
import {ApiService} from '../api/api.service';
import {SecurityService} from '../security/security.service';
import { RoleService } from '../security/role.service';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(
    private cacheService: EntityCacheService<Course>,
    private apiService: ApiService,
    private securityService: SecurityService,
    private roleService: RoleService
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
    const body = {courseId, userId}
    return this.apiService.post<any>(`course/enroll`, body);
  }

  loadEnrolledCourses(forceReload = false): void {
    this.cacheService.loadEntities(`course/index`, Course, this.getCourseRegistrationUserFilter(), forceReload);
  }

  getEnrolledCourses(): Course[] {
    return this.cacheService.filterCachedEntities(Course, this.getCourseRegistrationUserFilter());
  }

  private getCourseRegistrationUserFilter(): {[key: string]: any} {
    const userId = this.securityService.getUser()?.id;
    if (!userId) {
      throw new Error('User must be logged in to get course registrations');
    }
    return {'courseRegistrations.user': userId};
  }

  getCoursesByRole(): Course[] {
    let params: {[key: string]: any} = {};
    switch (this.roleService.activeRole) {
      case "ROLE_USER":
        params = {
          'courseRegistrations.user': this.securityService.getUser()?.id,
        };
        break;
      case "ROLE_ADMIN":
        break; // no params, get all courses
      case "ROLE_TEACHER":
        params = {
          userId: this.securityService.getUser()?.id,
        }
        break;
      default:
        console.warn(`Unknown or undefined role: ${this.roleService.activeRole}`);
    }

    this.loadCourses(params);
    return this.getCourses(params);
  }

  createCourse(course: Course): Observable<Course> {
    course.userId = this.securityService.getUser()?.id ?? 0;
    return this.apiService.post<Course>('course/create', course);
  }
}
