import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { EntityService } from './entity.service';
import { Entity } from '../../entities/entity';

@Injectable({
  providedIn: 'root'
})
export class EntityCacheService<T extends Entity> {
  // entityName -> (filterKey -> entity array)
  private cache: Map<string, Map<string, T[]>> = new Map();

  constructor(
    private apiService: ApiService,
    private entityService: EntityService
  ) {}

  private generateKey(params: { [key: string]: any }): string {
    return JSON.stringify(params, Object.keys(params).sort());
  }

  private getEntityName(entityClass: new () => T): string {
    return entityClass.name;
  }

  loadEntities(
    endpoint: string,
    entityClass: new () => T,
    params: { [key: string]: any } = {},
    forceReload = false
  ): void {
    const entityName = this.getEntityName(entityClass);
    const key = this.generateKey(params);

    if (!this.cache.has(entityName)) {
      this.cache.set(entityName, new Map());
    }

    const entityCache = this.cache.get(entityName)!;
    if (!forceReload && entityCache.has(key)) {
      return; // already loaded
    }

    this.apiService.get<T[]>(endpoint, params).subscribe({
      next: data => {
        const mapped = this.entityService.matchDataToEntity<T>(data, entityClass);
        entityCache.set(key, mapped);
      },
      error: err => {
        console.error(`Error fetching ${entityName} from ${endpoint}:`, err);
      }
    });
  }

  filterCachedEntities(
    entityClass: new () => T,
    params: { [key: string]: any }
  ): T[] {
    const entityName = this.getEntityName(entityClass);
    const key = this.generateKey(params);

    return this.cache.get(entityName)?.get(key) || [];
  }

  clearCache(entityClass?: new () => T): void {
    if (entityClass) {
      const entityName = this.getEntityName(entityClass);
      this.cache.delete(entityName);
    } else {
      this.cache.clear();
    }
  }
}
