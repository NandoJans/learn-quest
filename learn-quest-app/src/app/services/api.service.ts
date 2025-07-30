import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private API_URL = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  post<T>(path: string , body: object): Observable<T> {
    return this.http.post<T>(this.API_URL+this.parsePath(path), body);
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.API_URL + this.parsePath(path));
  }

  private parsePath(path: string): string {
    if (path.startsWith('/')) {
      return path;
    }
    return '/' + path;
  }
}
