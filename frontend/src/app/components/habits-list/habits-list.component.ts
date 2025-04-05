import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

interface Habit {
  _id: string;
  description: string;
  category: string;
  impact: number;
  frequency: string;
  isCompleted: boolean;
  date: Date;
}

@Component({
  selector: "app-habits-list",
  templateUrl: "./habits-list.component.html",
  styleUrls: ["./habits-list.component.scss"],
})
export class HabitsListComponent implements OnInit {
  habits: Habit[] = [];
  loading: boolean = true;
  categories: string[] = [
    "Transportation",
    "Food",
    "Energy",
    "Waste",
    "Water",
    "Shopping",
  ];
  selectedCategory: string = "";
  sortBy: string = "date";
  sortOrder: "asc" | "desc" = "desc";

  // Mock data for demo
  mockHabits: Habit[] = [
    {
      _id: "1",
      description: "Used public transportation instead of driving",
      category: "Transportation",
      impact: 3.2,
      frequency: "daily",
      isCompleted: true,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      _id: "2",
      description: "Ate a plant-based meal",
      category: "Food",
      impact: 2.5,
      frequency: "daily",
      isCompleted: true,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      _id: "3",
      description: "Used reusable water bottle",
      category: "Waste",
      impact: 0.5,
      frequency: "daily",
      isCompleted: false,
      date: new Date(),
    },
    {
      _id: "4",
      description: "Reduced shower time by 2 minutes",
      category: "Water",
      impact: 1.0,
      frequency: "daily",
      isCompleted: false,
      date: new Date(),
    },
    {
      _id: "5",
      description: "Avoided single-use plastics",
      category: "Waste",
      impact: 1.5,
      frequency: "daily",
      isCompleted: true,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Simulate API call delay
    setTimeout(() => {
      this.habits = this.mockHabits;
      this.loading = false;
    }, 1000);
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
          comparison = a.impact - b.impact;
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
    habit.isCompleted = true;
    // In a real app, this would send the update to the backend
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
    this.habits = this.habits.filter((h) => h._id !== habitId);
    // In a real app, this would send the delete request to the backend
  }

  // Get CSS class based on habit category
  getCategoryClass(category: string): string {
    const classMap: { [key: string]: string } = {
      Transportation: "category-transport",
      Food: "category-food",
      Energy: "category-energy",
      Waste: "category-waste",
      Water: "category-water",
      Shopping: "category-shopping",
    };

    return classMap[category] || "";
  }

  // Format date to display
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}
