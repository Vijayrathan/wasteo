import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";

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
  categories: string[] = [
    "Transportation",
    "Food",
    "Energy",
    "Waste",
    "Water",
    "Shopping",
  ];
  frequencies: string[] = ["daily", "weekly", "monthly", "one-time"];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.habitForm = this.formBuilder.group({
      description: ["", [Validators.required]],
      category: ["", [Validators.required]],
      impact: [1, [Validators.required, Validators.min(0)]],
      frequency: ["daily", [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.habitId = this.route.snapshot.paramMap.get("id");
    this.isEditMode = !!this.habitId;

    if (this.isEditMode && this.habitId) {
      this.loadHabitData(this.habitId);
    }
  }

  // In a real app, this would fetch data from an API
  loadHabitData(id: string): void {
    this.loading = true;

    // Mock data for demo - in a real app this would be an API call
    setTimeout(() => {
      // Find the habit in our mock data based on ID
      const habit = {
        _id: id,
        description: "Used public transportation instead of driving",
        category: "Transportation",
        impact: 3.2,
        frequency: "daily",
        isCompleted: false,
        date: new Date(),
      };

      // Patch the form with the habit data
      this.habitForm.patchValue({
        description: habit.description,
        category: habit.category,
        impact: habit.impact,
        frequency: habit.frequency,
      });

      this.loading = false;
    }, 1000);
  }

  onSubmit(): void {
    if (this.habitForm.invalid) {
      return;
    }

    const habitData = this.habitForm.value;

    // Add current date and completed status
    const completeHabitData = {
      ...habitData,
      date: new Date(),
      isCompleted: false,
    };

    if (this.isEditMode) {
      // In a real app, this would update the habit in the backend
      console.log("Updating habit:", completeHabitData);
    } else {
      // In a real app, this would create a new habit in the backend
      console.log("Creating new habit:", completeHabitData);
    }

    // Navigate back to habits list
    this.router.navigate(["/habits"]);
  }

  cancel(): void {
    this.router.navigate(["/habits"]);
  }
}
