import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private API_URL = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  post<T>(path: string, body: object): Observable<T> {
    return this.http.post<T>(this.API_URL + this.parsePath(path), body);
  }

  put<T>(path: string, body: object): Observable<T> {
    return this.http.put<T>(this.API_URL + this.parsePath(path), body);
  }

  get<T>(path: string, args: object = {}): Observable<T> {
    return this.http.get<T>(this.API_URL + this.parsePath(path, args));
  }

  delete<T>(path: string, args: object = {}): Observable<T> {
    return this.http.delete<T>(this.API_URL + this.parsePath(path, args));
  }

  private parsePath(path: string, args: object = {}): string {
    const entries: [string, any][] = Object.entries(args);
    if (entries.length > 0) {
      const equals: string[] = [];
      entries.forEach(([key, value]: [string, any]) => {
        equals.push(`${key}=${encodeURIComponent(value)}`);
      });
      path += '?' + equals.join('&');
    }
    if (path.startsWith('/')) {
      return path;
    }
    return '/' + path;
  }
}
