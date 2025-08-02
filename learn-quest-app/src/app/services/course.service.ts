import {Injectable} from '@angular/core';
import {Course} from '../entities/course';
import {EntityCacheService} from './entity-cache.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private cacheService: EntityCacheService<Course>) {}

  loadCourses(params: {[key: string]: any} = {}, forceReload = false): void {
    this.cacheService.loadEntities('course/index', Course, params, forceReload);
  }

  getCourses(params: {[key: string]: any} = {}): Course[] {
    return this.cacheService.filterCachedEntities(Course, params);
  }

  clearCache() {
    this.cacheService.clearCache();
  }
}
