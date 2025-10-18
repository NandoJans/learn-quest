import { Injectable } from '@angular/core';
import {LessonRegistration} from '../../entities/lesson-registration';
import {ApiService} from '../api/api.service';
import {EntityCacheService} from './entity-cache.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LessonRegistrationService {
  constructor(
    private cacheService: EntityCacheService<LessonRegistration>,
    private apiService: ApiService
  ) {
  }

  /** Load many into cache (optionally filtered) */
  loadSections(params: {
    [key: string]: any
  } = {}, onLoaded?: ((entities: LessonRegistration[]) => void) | undefined, forceReload = false): void {
    this.cacheService.loadEntities('LessonRegistration/index', LessonRegistration, params, forceReload, onLoaded);
  }

  /** Get many from cache (optionally filtered) */
  getSections(params: { [key: string]: any } = {}): LessonRegistration[] {
    return this.cacheService.filterCachedEntities(LessonRegistration, params);
  }

  /** Get one from cache by id (undefined if not present) */
  getSectionById(id: number): LessonRegistration | undefined {
    // If your cache has a direct getter, prefer that; otherwise filter:
    return this.cacheService
      .filterCachedEntities(LessonRegistration, {id})
      .find(s => s.id === id);
  }

  /** Fetch one from API (does not write to cache unless your ApiService does it internally) */
  fetchSection(id: number): Observable<LessonRegistration> {
    return this.apiService.get<LessonRegistration>(`LessonRegistration/${id}`);
  }

  /** Create via API */
  createSection(section: LessonRegistration): Observable<LessonRegistration> {
    return this.apiService.post<LessonRegistration>('LessonRegistration/create', section);
  }

  /** Update via API */
  updateSection(section: LessonRegistration): Observable<LessonRegistration> {
    let sendSection = {...section};
    // Remove unwanted fields such as lesson;
    delete (sendSection as any).lesson;
    return this.apiService.put<LessonRegistration>(`LessonRegistration/${section.id}`, sendSection);
  }

  /** Delete via API */
  deleteSection(id: number): Observable<void> {
    return this.apiService.delete<void>(`LessonRegistration/${id}`);
  }

  /** Convenience: create or update depending on presence of id */
  saveSection(section: LessonRegistration): Observable<LessonRegistration> {
    return section.id ? this.updateSection(section) : this.createSection(section);
  }

  /** Clear cache for this entity type */
  clearCache(): void {
    this.cacheService.clearCache(LessonRegistration);
  }
}
