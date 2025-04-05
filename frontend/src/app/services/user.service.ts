import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import {
  User,
  UserStats,
  AuthResponse,
  UserPreferences,
} from "../models/user.model";
import { environment } from "../../environments/environment";

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/users`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userString = localStorage.getItem("currentUser");
    if (userString) {
      try {
        const userData = JSON.parse(userString);
        this.currentUserSubject.next(userData);
      } catch (error) {
        console.error("Error parsing stored user data", error);
        localStorage.removeItem("currentUser");
      }
    }
  }

  // Register a new user
  register(user: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // Login user
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem("token", response.token);
          localStorage.setItem("currentUser", JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  // Get user by ID
  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`);
  }

  // Update user profile
  updateProfile(userId: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, userData).pipe(
      tap((updatedUser) => {
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser._id === updatedUser._id) {
          const newUserData = { ...currentUser, ...updatedUser };
          localStorage.setItem("currentUser", JSON.stringify(newUserData));
          this.currentUserSubject.next(newUserData);
        }
      })
    );
  }

  // Get user sustainability stats
  getUserStats(userId: string): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/${userId}/stats`);
  }

  // Get user badges
  getUserBadges(userId: string): Observable<{ badges: string[] }> {
    return this.http.get<{ badges: string[] }>(
      `${this.apiUrl}/${userId}/badges`
    );
  }

  // Update user preferences
  updateUserPreferences(
    userId: string,
    preferences: UserPreferences
  ): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/preferences`, {
      goalPreferences: preferences,
    });
  }

  // Log out user and clear storage
  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    this.currentUserSubject.next(null);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem("token");
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }
}
