import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LessonSectionAnswer } from '../../entities/lesson-section-answer';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class LessonSectionAnswerService {

  constructor(private apiService: ApiService) {}

  submitAnswer(lessonSectionId: number, answer: string): Observable<any> {
    return this.apiService.post('lesson_section_answer/submit', {
      lessonSectionId,
      answer
    });
  }

  getUserAnswer(lessonSectionId: number): Observable<LessonSectionAnswer | null> {
    return this.apiService.get<LessonSectionAnswer | null>(`lesson_section_answer/section/${lessonSectionId}`);
  }
}
