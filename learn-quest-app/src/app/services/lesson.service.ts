import { Injectable } from '@angular/core';
import { Lesson } from '../entities/lesson';
import {ApiService} from './api.service';
import {EntityService} from './entity.service';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  lessons: Lesson[] = [];

  constructor(
    private apiService: ApiService,
    private entityService: EntityService
  ) {}

  getLessons() {
    return this.lessons;
  }

  loadLessons(params: object = {}) {

    this.apiService.get<Lesson>('lesson/index', params).subscribe({
      next: (data: any) => {
        console.log(data);
        this.lessons = this.entityService.matchDataToEntity<Lesson>(data, Lesson);
      },
      error: (error: any) => {
        console.error('Error loading courses:', error);
      }
    });
  }
}
