import { Injectable } from '@angular/core';
import { EntityCacheService } from './entity-cache.service';
import { LessonSection } from '../entities/lesson-section';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LessonSectionService {

  constructor(
    private cacheService: EntityCacheService<LessonSection>,
    private apiService: ApiService
  ) {}

  /** Load many into cache (optionally filtered) */
  loadSections(params: {[key: string]: any} = {}, forceReload = false): void {
    this.cacheService.loadEntities('lesson_section/index', LessonSection, params, forceReload);
  }

  /** Get many from cache (optionally filtered) */
  getSections(params: {[key: string]: any} = {}): LessonSection[] {
    return this.cacheService.filterCachedEntities(LessonSection, params);
  }

  /** Get one from cache by id (undefined if not present) */
  getSectionById(id: number): LessonSection | undefined {
    // If your cache has a direct getter, prefer that; otherwise filter:
    return this.cacheService
      .filterCachedEntities(LessonSection, { id })
      .find(s => s.id === id);
  }

  /** Fetch one from API (does not write to cache unless your ApiService does it internally) */
  fetchSection(id: number): Observable<LessonSection> {
    return this.apiService.get<LessonSection>(`lesson_section/${id}`);
  }

  /** Create via API */
  createSection(section: LessonSection): Observable<LessonSection> {
    return this.apiService.post<LessonSection>('lesson_section/create', section);
  }

  /** Update via API */
  updateSection(section: LessonSection): Observable<LessonSection> {
    return this.apiService.put<LessonSection>(`lesson_section/${section.id}`, section);
  }

  /** Delete via API */
  deleteSection(id: number): Observable<void> {
    return this.apiService.delete<void>(`lesson_section/${id}`);
  }

  /** Convenience: create or update depending on presence of id */
  saveSection(section: LessonSection): Observable<LessonSection> {
    return section.id ? this.updateSection(section) : this.createSection(section);
  }

  /** Clear cache for this entity type */
  clearCache(): void {
    this.cacheService.clearCache(LessonSection);
  }
}
