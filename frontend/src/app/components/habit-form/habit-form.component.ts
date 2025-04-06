import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { HabitService } from "../../services/habit.service";
import { AuthService } from "../../services/auth.service";
import { HabitCategory } from "../../models/habit.model";

@Component({
  selector: "app-habit-form",
  templateUrl: "./habit-form.component.html",
  styleUrls: ["./habit-form.component.scss"],
})
export class HabitFormComponent implements OnInit {
  habitForm!: FormGroup;
  isEditMode: boolean = false;
  habitId: string | null = null;
  loading: boolean = false;
  categories: HabitCategory[] = [
    "transport",
    "energy",
    "diet",
    "waste",
    "water",
    "other"
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private habitService: HabitService,
    private authService: AuthService
  ) {
    this.habitForm = this.formBuilder.group({
      description: ["", [Validators.required]],
      category: ["", [Validators.required]],
      carbonFootprint: [1, [Validators.required, Validators.min(0)]],
      sustainableAlternative: [""],
    });

    // For development/testing, set a mock user if none exists
    if (!this.authService.currentUserValue) {
      this.authService.setMockUser();
    }
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.habitId = this.route.snapshot.paramMap.get("id");
    this.isEditMode = !!this.habitId;

    if (this.isEditMode && this.habitId) {
      this.loadHabitData(this.habitId);
    }
  }

  loadHabitData(id: string): void {
    this.loading = true;
    this.habitService.getHabitById(id).subscribe({
      next: (habit) => {
        this.habitForm.patchValue({
          description: habit.description,
          category: habit.category,
          carbonFootprint: habit.carbonFootprint,
          sustainableAlternative: habit.sustainableAlternative,
        });
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading habit:", error);
        this.loading = false;
        // Handle error appropriately
      },
    });
  }

  onSubmit(): void {
    if (this.habitForm.invalid) {
      return;
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      console.error('No user logged in');
      // Handle the error appropriately (e.g., redirect to login)
      return;
    }

    this.loading = true;
    const habitData = this.habitForm.value;

    // Add required fields for new habit
    const completeHabitData = {
      ...habitData,
      date: new Date(),
      isCompleted: false,
      pointsEarned: 0,
      userId: currentUser._id, // Use the actual user ID from auth service
    };

    if (this.isEditMode && this.habitId) {
      this.habitService.updateHabit(this.habitId, completeHabitData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(["/habits"]);
        },
        error: (error) => {
          console.error("Error updating habit:", error);
          this.loading = false;
          // Handle error appropriately
        },
      });
    } else {
      this.habitService.createHabit(completeHabitData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(["/habits"]);
        },
        error: (error) => {
          console.error("Error creating habit:", error);
          this.loading = false;
          // Handle error appropriately
        },
      });
    }
  }

  cancel(): void {
    this.router.navigate(["/habits"]);
  }
}
