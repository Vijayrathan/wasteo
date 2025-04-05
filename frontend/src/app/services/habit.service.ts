import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  Habit,
  HabitCompletion,
  WeeklyHabitSummary,
  HabitCategory,
} from "../models/habit.model";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class HabitService {
  private apiUrl = `${environment.apiUrl}/habits`;

  constructor(private http: HttpClient) {}

  // Get all habits for a user
  getUserHabits(userId: string): Observable<Habit[]> {
    const params = new HttpParams().set("userId", userId);
    return this.http.get<Habit[]>(this.apiUrl, { params });
  }

  // Get habit by ID
  getHabitById(habitId: string): Observable<Habit> {
    return this.http.get<Habit>(`${this.apiUrl}/${habitId}`);
  }

  // Create new habit
  createHabit(habitData: Partial<Habit>): Observable<Habit> {
    return this.http.post<Habit>(this.apiUrl, habitData);
  }

  // Update habit
  updateHabit(habitId: string, habitData: Partial<Habit>): Observable<Habit> {
    return this.http.put<Habit>(`${this.apiUrl}/${habitId}`, habitData);
  }

  // Delete habit
  deleteHabit(habitId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${habitId}`);
  }

  // Complete habit
  completeHabit(habitId: string): Observable<HabitCompletion> {
    return this.http.post<HabitCompletion>(
      `${this.apiUrl}/${habitId}/complete`,
      {}
    );
  }

  // Get weekly habit summary
  getWeeklyHabitSummary(userId: string): Observable<WeeklyHabitSummary> {
    const params = new HttpParams().set("userId", userId);
    return this.http.get<WeeklyHabitSummary>(`${this.apiUrl}/summary/weekly`, {
      params,
    });
  }

  // Get habits by category
  getHabitsByCategory(
    userId: string,
    category: HabitCategory
  ): Observable<Habit[]> {
    const params = new HttpParams().set("userId", userId);
    return this.http.get<Habit[]>(`${this.apiUrl}/categories/${category}`, {
      params,
    });
  }

  // Calculate carbon footprint reduction for habits
  calculateCarbonReduction(habits: Habit[]): number {
    if (!habits || habits.length === 0) return 0;

    // Sum up carbon footprint values from all habits
    return habits.reduce(
      (total, habit) => total + (habit.carbonFootprint || 0),
      0
    );
  }

  // Group habits by category
  groupHabitsByCategory(habits: Habit[]): Record<HabitCategory, Habit[]> {
    if (!habits || habits.length === 0)
      return {} as Record<HabitCategory, Habit[]>;

    return habits.reduce((grouped, habit) => {
      const category = habit.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(habit);
      return grouped;
    }, {} as Record<HabitCategory, Habit[]>);
  }
}
