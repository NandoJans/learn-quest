  import { Injectable } from '@angular/core';
  import {ApiService} from './api.service';
  import {Observable} from 'rxjs';
  import {StorageService} from './storage.service';
  import {jwtDecode, JwtPayload} from 'jwt-decode';
  import {User} from '../entities/user';
  import {UserJwtPayload} from '../interfaces/user-jwt-payload';

  @Injectable({
    providedIn: 'root'
  })
  export class SecurityService {
    user: User | null = null;

    constructor(
      private apiService: ApiService,
      private storageService: StorageService,
    ) { }

    login(username: string, password: string): Observable<{ token: string }> {
      const observable: Observable<{ token: string }> = this.apiService.post('/login', {
        username, password
      })

      observable.subscribe({
        next: (response: { token: string }) => {
          // Store the token in local storage
          this.setToken(response.token);
          // Create a User object from the decoded token
          this.setUserBasedOnToken();
        },
      })

      return observable;
    }

    getUser(): User | null {
      if (!this.user) {
        this.setUserBasedOnToken();
      }
      return this.user;
    }

    logout(): void {
      this.storageService.remove('token');
      this.user = null;
    }

    setUserBasedOnToken(): void {
      const token = this.getToken();

      if (!token) {
        this.user = null;
        return;
      }

      try {
        const decoded = jwtDecode<UserJwtPayload>(token);
        console.log(decoded);
        if (!decoded.id || !decoded.username) {
          this.user = null;
          return;
        }

        this.user = new User();
        this.user.id = decoded.id;
        this.user.username = decoded.username;
        this.user.roles = decoded.roles || [];

        console.log(this.user);
      } catch (e) {
        console.error('Invalid token:', e);
        this.user = null;
      }
    }

    setToken(token: string): void {
      this.storageService.set('token', token);
    }

    getToken(): string | null {
      return this.storageService.get<string>('token');
    }

    isTokenExpired(): boolean {
      const token = this.getToken();
      if (!token) return true;

      try {
        const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
        const now: number = Math.floor(Date.now() / 1000); // current time in seconds
        if (!decoded.exp) return true; // no expiration in token
        return decoded.exp < now;
      } catch (e) {
        return true; // invalid token = expired for safety
      }
    }
  }
