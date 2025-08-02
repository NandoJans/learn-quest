import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EntityService {

  constructor() { }

  matchDataToEntity<T>(data: any[], entityClass: { new (): T }): T[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => Object.assign(new entityClass() as T, item));
  }
}
