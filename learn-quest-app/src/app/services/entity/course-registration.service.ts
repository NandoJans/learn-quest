import { Injectable } from '@angular/core';
import {EntityCacheService} from './entity-cache.service';
import {ApiService} from '../api/api.service';
import {Observable} from 'rxjs';
import { CourseRegistration } from '../../entities/course-registration';

@Injectable({
  providedIn: 'root'
})
export class CourseRegistrationService {
  constructor(
    private cacheService: EntityCacheService<CourseRegistration>,
    private apiService: ApiService
  ) {
  }

  /** Load many into cache (optionally filtered) */
  loadSections(params: {
    [key: string]: any
  } = {}, onLoaded?: ((entities: CourseRegistration[]) => void) | undefined, forceReload = false): void {
    this.cacheService.loadEntities('CourseRegistration/index', CourseRegistration, params, forceReload, onLoaded);
  }

  /** Get many from cache (optionally filtered) */
  getSections(params: { [key: string]: any } = {}): CourseRegistration[] {
    return this.cacheService.filterCachedEntities(CourseRegistration, params);
  }

  /** Get one from cache by id (undefined if not present) */
  getSectionById(id: number): CourseRegistration | undefined {
    // If your cache has a direct getter, prefer that; otherwise filter:
    return this.cacheService
      .filterCachedEntities(CourseRegistration, {id})
      .find(s => s.id === id);
  }

  /** Fetch one from API (does not write to cache unless your ApiService does it internally) */
  fetchSection(id: number): Observable<CourseRegistration> {
    return this.apiService.get<CourseRegistration>(`CourseRegistration/${id}`);
  }

  /** Create via API */
  createSection(section: CourseRegistration): Observable<CourseRegistration> {
    return this.apiService.post<CourseRegistration>('CourseRegistration/create', section);
  }

  /** Update via API */
  updateSection(section: CourseRegistration): Observable<CourseRegistration> {
    return this.apiService.put<CourseRegistration>(`CourseRegistration/${section.id}`, section);
  }

  /** Delete via API */
  deleteSection(id: number): Observable<void> {
    return this.apiService.delete<void>(`CourseRegistration/${id}`);
  }

  /** Convenience: create or update depending on presence of id */
  saveSection(section: CourseRegistration): Observable<CourseRegistration> {
    return section.id ? this.updateSection(section) : this.createSection(section);
  }

  /** Clear cache for this entity type */
  clearCache(): void {
    this.cacheService.clearCache(CourseRegistration);
  }
}
