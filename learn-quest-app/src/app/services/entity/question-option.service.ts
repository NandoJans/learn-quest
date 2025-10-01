import { Injectable } from '@angular/core';
import { EntityCacheService } from './entity-cache.service';
import { QuestionOption } from '../../entities/question-option';
import { ApiService } from '../api/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionOptionService {

  constructor(
    private cacheService: EntityCacheService<QuestionOption>,
    private apiService: ApiService
  ) {}

  /** Load many into cache (optionally filtered) */
  loadQuestionOptions(params: {[key: string]: any} = {}, forceReload = false): void {
    this.cacheService.loadEntities('question_option/index', QuestionOption, params, forceReload);
  }

  /** Get many from cache (optionally filtered) */
  getQuestionOptions(params: {[key: string]: any} = {}): QuestionOption[] {
    return this.cacheService.filterCachedEntities(QuestionOption, params);
  }

  /** Get one from cache by id (undefined if not present) */
  getQuestionOptionById(id: number): QuestionOption | undefined {
    return this.cacheService
      .filterCachedEntities(QuestionOption, { id })
      .find(o => o.id === id);
  }

  /** Fetch question options from API by lessonSectionId */
  fetchQuestionOptionsByLessonSection(lessonSectionId: number): Observable<QuestionOption[]> {
    return this.apiService.get<QuestionOption[]>(`question_option/index?lessonSection=${lessonSectionId}`);
  }

  /** Fetch question options from API by lessonId */
  fetchQuestionOptionsByLesson(lessonId: number): Observable<QuestionOption[]> {
    return this.apiService.get<QuestionOption[]>(`question_option/index?lesson=${lessonId}`);
  }

  /** Clear cache for this entity type */
  clearCache(): void {
    this.cacheService.clearCache(QuestionOption);
  }
}
