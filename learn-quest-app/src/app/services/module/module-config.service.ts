import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {ApiService} from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ModuleConfigService {
  constructor(private apiService: ApiService) {}

  /** Replace with your real API shape; this is just a placeholder */
  getConfigForSlug(slug: string): Observable<any> {
    // e.g. /api/module_config?slug=math-practice OR per-lesson block config
    // return this.http.get<any>('/api/module_config', { params: { slug } });
    return this.apiService.get<any>(`module/config/${slug}`);
  }
}
