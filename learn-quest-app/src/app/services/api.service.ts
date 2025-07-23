import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private API_URL = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  post(path: string , body: object): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.API_URL+this.parsePath(path), body);
  }

  private parsePath(path: string): string {
    if (path.startsWith('/')) {
      return path;
    }
    return '/' + path;
  }
}
