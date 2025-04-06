import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize with stored user data if available
    this.refreshUserFromStorage();
    
    // Listen for storage events to sync across tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'currentUser') {
        this.refreshUserFromStorage();
      }
    });
  }
  
  private refreshUserFromStorage(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    } else {
      this.currentUserSubject.next(null);
    }
  }

  public get currentUserValue() {
    // Always get the latest user from storage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/auth/login`, { email, password });
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    console.log('AuthService: User logged out');
  }

  // For development/testing purposes, set a mock user
  setMockUser() {
    const mockUser = {
      _id: '64f5c1e7a9b7c34b8e5d1234', // Mock user ID
      email: 'test@example.com',
      name: 'Test User'
    };
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    this.currentUserSubject.next(mockUser);
  }
} 