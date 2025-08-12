import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModuleConfigService {
  constructor(private http: HttpClient) {}

  /** Replace with your real API shape; this is just a placeholder */
  getConfigForSlug(slug: string): Observable<any> {
    // e.g. /api/module_config?slug=math-practice OR per-lesson block config
    // return this.http.get<any>('/api/module_config', { params: { slug } });
    return of(null);
  }
}
