import { Injectable } from '@angular/core';
import {Entity} from '../entities/entity';

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  constructor() { }

  matchDataToEntity<T>(data: any[], entityClass: { new (): T }): T[] {
    if (!Array.isArray(data)) return [];
    // @ts-ignore
    return data.map(item => Object.assign(new entityClass() as T, item));
  }

  filterEntities<T>(courses: T[], params: { [key: string]: any }): T[] {
    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return [];
    }

    return courses.filter(course => {
      let matches = true;
      const courseObject = course as { [key: string]: any };
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          const value = params[key];
          if (courseObject[key] != value) {
            matches = false;
            break;
          }
        }
      }
      return matches;
    });
  }
}
