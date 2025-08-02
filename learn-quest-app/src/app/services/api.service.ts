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

  get<T>(path: string, args: object = {}): Observable<T> {
    return this.http.get<T>(this.API_URL + this.parsePath(path, args));
  }

  private parsePath(path: string, args: object = {}): string {
    // Replace placeholders in the path with values from args
    const entries: [string, any][] = Object.entries(args);
    if (entries.length > 0) {
      const equals: string[] = [];
      entries.forEach(([key, value]: [string, any]) => {
        equals.push(`${key}=${encodeURIComponent(value)}`);
      });

      path += '?' + equals.join('&');
    }
    console.log(path, args);
    if (path.startsWith('/')) {
      return path;
    }
    return '/' + path;
  }
}
