import { Injectable } from '@angular/core';
import { EntityCacheService } from './entity-cache.service';
import {Lesson} from '../../entities/lesson';
import {Course} from '../../entities/course';
import {Observable} from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class LessonService {

  constructor(
    private cacheService: EntityCacheService<Lesson>,
    private apiService: ApiService,
  ) {}

  loadLessons(params: {[key: string]: any} = {}, forceReload = false): void {
    this.cacheService.loadEntities('lesson/index', Lesson, params, forceReload);
  }

  getLessons(params: {[key: string]: any} = {}): Lesson[] {
    return this.cacheService.filterCachedEntities(Lesson, params);
  }

  clearCache() {
    this.cacheService.clearCache();
  }

  createLesson(lesson: Lesson, course: Course): Observable<Lesson> {
    lesson.courseId = course.id;
    return this.apiService.post<Lesson>('lesson/create', lesson);
  }
}
