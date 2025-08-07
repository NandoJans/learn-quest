import { Injectable } from '@angular/core';
import { EntityCacheService } from './entity-cache.service';
import { LessonSection } from '../entities/lesson-section';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LessonSectionService {

  constructor(private cacheService: EntityCacheService<LessonSection>, private apiService: ApiService) {}

  loadSections(params: {[key: string]: any} = {}, forceReload = false): void {
    this.cacheService.loadEntities('lesson_section/index', LessonSection, params, forceReload);
  }

  getSections(params: {[key: string]: any} = {}): LessonSection[] {
    return this.cacheService.filterCachedEntities(LessonSection, params);
  }

  createSection(section: LessonSection): Observable<LessonSection> {
    return this.apiService.post<LessonSection>('lesson_section/create', section);
  }

  updateSection(section: LessonSection): Observable<LessonSection> {
    return this.apiService.put<LessonSection>(`lesson_section/${section.id}`, section);
  }

  clearCache() {
    this.cacheService.clearCache(LessonSection);
  }
}
