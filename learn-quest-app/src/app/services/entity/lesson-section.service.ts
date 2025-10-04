import {Injectable} from '@angular/core';
import {EntityCacheService} from './entity-cache.service';
import {LessonSection} from '../../entities/lesson-section';
import {ApiService} from '../api/api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LessonSectionService {

  constructor(
    private cacheService: EntityCacheService<LessonSection>,
    private apiService: ApiService
  ) {
  }

  /** Load many into cache (optionally filtered) */
  loadSections(params: {
    [key: string]: any
  } = {}, onLoaded?: ((entities: LessonSection[]) => void) | undefined, forceReload = false): void {
    this.cacheService.loadEntities('lessonSection/index', LessonSection, params, forceReload, onLoaded);
  }

  /** Get many from cache (optionally filtered) */
  getSections(params: { [key: string]: any } = {}): LessonSection[] {
    return this.cacheService.filterCachedEntities(LessonSection, params);
  }

  /** Get one from cache by id (undefined if not present) */
  getSectionById(id: number): LessonSection | undefined {
    // If your cache has a direct getter, prefer that; otherwise filter:
    return this.cacheService
      .filterCachedEntities(LessonSection, {id})
      .find(s => s.id === id);
  }

  /** Fetch one from API (does not write to cache unless your ApiService does it internally) */
  fetchSection(id: number): Observable<LessonSection> {
    return this.apiService.get<LessonSection>(`lessonSection/${id}`);
  }

  /** Create via API */
  createSection(section: LessonSection): Observable<LessonSection> {
    return this.apiService.post<LessonSection>('lessonSection/create', section);
  }

  /** Update via API */
  updateSection(section: LessonSection): Observable<LessonSection> {
    return this.apiService.put<LessonSection>(`lessonSection/${section.id}`, section);
  }

  /** Delete via API */
  deleteSection(id: number): Observable<void> {
    return this.apiService.delete<void>(`lessonSection/${id}`);
  }

  /** Convenience: create or update depending on presence of id */
  saveSection(section: LessonSection): Observable<LessonSection> {
    return section.id ? this.updateSection(section) : this.createSection(section);
  }

  /** Clear cache for this entity type */
  clearCache(): void {
    this.cacheService.clearCache(LessonSection);
  }

  /** Fetch via dedicated endpoint with optional answers for a registration */
  fetchSectionsWithAnswers(lessonId: number, lessonRegistrationId?: number): Observable<LessonSection[]> {
    const params: any = { lessonId };
    if (lessonRegistrationId) params.lessonRegistrationId = lessonRegistrationId;
    return this.apiService.get<LessonSection[]>(`lesson_section/index`, params);
  }

  /** Check an answer for a section */
  checkAnswer(sectionId: number, answer: any, lessonRegistrationId?: number): Observable<{ correct: boolean }> {
    // Dedicated endpoint lives under snake_case path
    const body: any = { answer };
    if (lessonRegistrationId) body.lessonRegistrationId = lessonRegistrationId;
    return this.apiService.post<{ correct: boolean }>(`lesson_section/${sectionId}/check_answer`, body);
  }
}
