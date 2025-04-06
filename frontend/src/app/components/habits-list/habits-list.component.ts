import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { HabitService } from "../../services/habit.service";
import { AuthService } from "../../services/auth.service";
import { Habit } from "../../models/habit.model";
import { Subscription, filter } from "rxjs";

@Component({
  selector: "app-habits-list",
  templateUrl: "./habits-list.component.html",
  styleUrls: ["./habits-list.component.scss"],
})
export class HabitsListComponent implements OnInit, OnDestroy {
  habits: Habit[] = [];
  loading: boolean = true;
  categories: string[] = [
    "transport",
    "energy",
    "diet",
    "waste",
    "water",
    "other",
  ];
  selectedCategory: string = "";
  sortBy: string = "date";
  sortOrder: "asc" | "desc" = "desc";
  private routerSubscription: Subscription = new Subscription();
  private authSubscription: Subscription = new Subscription();

  constructor(
    private router: Router,
    private habitService: HabitService,
    private authService: AuthService
  ) {
    // Subscribe to router events to detect when we navigate to this component
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        // Need to cast the event as NavigationEnd after filtering
        const navEvent = event as NavigationEnd;
        
        // Check if we're navigating to the habits list page
        if (this.isHabitsRoute(navEvent.urlAfterRedirects) || this.isHabitsRoute(navEvent.url)) {
          console.log('Navigation to habits detected, reloading data');
          this.loadHabits();
        }
      });
      
    // Subscribe to auth changes
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      console.log('Auth state changed:', user ? `User ${user._id} logged in` : 'No user');
      if (this.isHabitsRoute(this.router.url)) {
        console.log('Currently on habits page, reloading data after auth change');
        this.loadHabits();
      }
    });
  }

  // Helper method to check if a URL is related to the habits list
  private isHabitsRoute(url: string): boolean {
    return url === '/habits' || 
           url.startsWith('/habits?') ||
           url === '/habits/' ||
           url.startsWith('/habits/?');
  }

  ngOnInit(): void {
    console.log('HabitsListComponent initialized, current URL:', this.router.url);
    
    // Check if we're already on a habits route
    if (this.isHabitsRoute(this.router.url)) {
      console.log('Already on habits route, loading habits data');
    }
    
    // Initial load of habits regardless
    this.loadHabits();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions when component is destroyed
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadHabits(): void {
    console.log('Loading habits...');
    this.loading = true;
    this.habits = []; // Clear previous habits
    
    // Get the current user directly from localStorage for reliability
    const userStr = localStorage.getItem('currentUser');
    let currentUser = null;
    
    if (userStr) {
      try {
        currentUser = JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
    
    // Fallback to AuthService if localStorage doesn't have user
    if (!currentUser) {
      currentUser = this.authService.currentUserValue;
    }
    
    if (currentUser && currentUser._id) {
      console.log('Fetching habits for user:', currentUser._id);
      this.habitService.getUserHabits(currentUser._id).subscribe({
        next: (data) => {
          console.log('Successfully loaded habits data:', data);
          this.habits = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching habits:', error);
          this.loading = false;
          // Display error to user if needed
        },
        complete: () => {
          console.log('Habits request completed');
        }
      });
    } else {
      console.warn('No user logged in or missing user ID');
      // If no user is logged in, empty the habits list
      this.habits = [];
      this.loading = false;
    }
  }

  // Filter habits by category
  filterByCategory(): Habit[] {
    if (!this.selectedCategory) {
      return this.sortHabits([...this.habits]);
    }
    return this.sortHabits(
      this.habits.filter((habit) => habit.category === this.selectedCategory)
    );
  }

  // Sort habits
  sortHabits(habits: Habit[]): Habit[] {
    return habits.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "impact":
        case "carbonFootprint":
          // Handle both the old impact property and the new carbonFootprint
          const aImpact = 'impact' in a ? (a as any).impact : a.carbonFootprint;
          const bImpact = 'impact' in b ? (b as any).impact : b.carbonFootprint;
          comparison = aImpact - bImpact;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "completed":
          comparison =
            a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? -1 : 1;
          break;
        default:
          comparison = 0;
      }

      return this.sortOrder === "asc" ? comparison : -comparison;
    });
  }

  // Toggle sort order
  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
  }

  // Mark habit as completed
  completeHabit(habit: Habit): void {
    if (!habit._id) return;
    
    // Set UI to completed immediately for better UX
    habit.isCompleted = true;
    
    // Call the dedicated complete habit endpoint
    this.habitService.completeHabit(habit._id).subscribe({
      next: (response) => {
        console.log('Habit completed successfully:', response);
        // Update the habit with additional data from response if needed
        if (response.habit) {
          // Find the habit in the list and update it with server data
          const index = this.habits.findIndex(h => h._id === habit._id);
          if (index >= 0) {
            this.habits[index] = response.habit;
          }
        }
        
        // Show a success notification if you have a notification service
        // this.notificationService.success('Habit completed successfully!');
      },
      error: (error) => {
        console.error('Error completing habit:', error);
        // Revert UI change if backend update fails
        habit.isCompleted = false;
        
        // Show an error notification if you have a notification service
        // this.notificationService.error('Failed to complete habit. Please try again.');
      }
    });
  }

  // Navigate to add new habit
  addHabit(): void {
    this.router.navigate(["/habits/new"]);
  }

  // Navigate to edit habit
  editHabit(habitId: string): void {
    this.router.navigate(["/habits/edit", habitId]);
  }

  // Delete a habit
  deleteHabit(habitId: string): void {
    this.habitService.deleteHabit(habitId).subscribe(
      () => {
        this.habits = this.habits.filter((h) => h._id !== habitId);
        console.log('Habit deleted successfully');
      },
      (error) => {
        console.error('Error deleting habit:', error);
      }
    );
  }

  // Get CSS class based on habit category
  getCategoryClass(category: string): string {
    const classMap: { [key: string]: string } = {
      transport: "category-transport",
      energy: "category-energy",
      diet: "category-food",
      waste: "category-waste",
      water: "category-water",
      other: "category-shopping",
    };

    return classMap[category] || "";
  }

  // Format date to display
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
