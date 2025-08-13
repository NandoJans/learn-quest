import { Injectable } from '@angular/core';
import { EntityCacheService } from './entity-cache.service';
import {Lesson} from '../../entities/lesson';

@Injectable({
  providedIn: 'root'
})
export class LessonService {

  constructor(private cacheService: EntityCacheService<Lesson>) {}

  loadLessons(params: {[key: string]: any} = {}, forceReload = false): void {
    this.cacheService.loadEntities('lesson/index', Lesson, params, forceReload);
  }

  getLessons(params: {[key: string]: any} = {}): Lesson[] {
    return this.cacheService.filterCachedEntities(Lesson, params);
  }

  clearCache() {
    this.cacheService.clearCache();
  }
}
