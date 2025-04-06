import { Component, OnInit } from "@angular/core";
import { HabitService } from "../../services/habit.service";
import { UserService } from "../../services/user.service";
import { AiService } from "../../services/ai.service";
import { Habit, HabitCategory } from "../../models/habit.model";
import { User, UserStats } from "../../models/user.model";
import { Router } from "@angular/router";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  userStats: UserStats = {
    sustainabilityScore: 0,
    greenPoints: 0,
    badges: [],
  };
  recentHabits: Habit[] = [];
  weeklySummary: any = {
    totalHabits: 0,
    completedHabits: 0,
    pointsEarned: 0,
    carbonFootprint: 0,
    habitsByCategory: {},
  };
  habitAnalysis: string = "";
  isLoading = true;
  suggestedTips: string = "";
  userName: string = "";
  ecoChallengesCompleted: number = 0;
  carbonSaved: number = 0;
  streakDays: number = 0;

  // Mock recent activities
  recentActivities = [
    {
      action: "Completed challenge",
      description: "Avoided single-use plastic for a day",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      action: "New habit",
      description: "Started tracking public transport usage",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      action: "Completed challenge",
      description: "Used reusable grocery bags for shopping",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ];

  // Mock upcoming challenges
  upcomingChallenges = [
    {
      title: "Meatless Monday",
      description: "Skip meat for a full day",
      impact: "Saves ~8kg of CO2",
    },
    {
      title: "Energy Saver",
      description: "Reduce electricity usage by 10%",
      impact: "Saves ~5kg of CO2",
    },
    {
      title: "Zero Waste Day",
      description: "Produce no waste for 24 hours",
      impact: "Prevents landfill waste",
    },
  ];

  // Chart data
  chartData: any = {
    carbonByCategory: {
      labels: [] as string[],
      datasets: [
        {
          data: [] as number[],
          backgroundColor: [
            "#4CAF50",
            "#2196F3",
            "#FFC107",
            "#FF5722",
            "#9C27B0",
            "#607D8B",
          ],
        },
      ],
    },
    progressByDay: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Points Earned",
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: "#4CAF50",
        },
      ],
    },
  };

  constructor(
    private habitService: HabitService,
    private userService: UserService,
    private aiService: AiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  private loadUserData(): void {
    this.currentUser = this.userService.getCurrentUser();
    if (this.currentUser && this.currentUser._id) {
      // Load user stats
      this.userService.getUserStats(this.currentUser._id).subscribe((stats) => {
        this.userStats = stats;
      });

      // Load user habits
      this.habitService
        .getUserHabits(this.currentUser._id)
        .subscribe((habits) => {
          this.recentHabits = habits.slice(0, 5); // Get 5 most recent
          this.prepareCategoryChartData(habits);
          this.isLoading = false;
        });

      // Load weekly habit summary
      this.habitService
        .getWeeklyHabitSummary(this.currentUser._id)
        .subscribe((summary) => {
          this.weeklySummary = summary.stats;
          this.prepareWeeklyChartData(summary);
        });

      // Get AI-powered habit analysis
      this.aiService
        .analyzeHabits(this.currentUser._id)
        .subscribe((response) => {
          this.habitAnalysis = response.analysis;
        });

      // Get sustainability tips
      this.aiService
        .getSuggestions(this.currentUser._id)
        .subscribe((response) => {
          this.suggestedTips = response.suggestions;
        });

      if (this.currentUser) {
        this.userName = this.currentUser.name;
      }

      // Placeholder for actual data fetching
      this.loadDashboardStats();
    }
  }

  // Prepare data for the category chart
  private prepareCategoryChartData(habits: Habit[]): void {
    const grouped: Record<HabitCategory, Habit[]> = this.habitService.groupHabitsByCategory(habits);

    this.chartData.carbonByCategory.labels = Object.keys(grouped).map((cat) =>
      this.formatCategoryName(cat as HabitCategory)
    );

    this.chartData.carbonByCategory.datasets[0].data = Object.keys(grouped).map(
      (cat) => this.habitService.calculateCarbonReduction(grouped[cat as HabitCategory])
    );
  }

  // Prepare data for the weekly progress chart
  private prepareWeeklyChartData(summary: any): void {
    if (!summary || !summary.habits || summary.habits.length === 0) return;

    const pointsByDay: number[] = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Group points by day of week
    summary.habits.forEach((habit: Habit) => {
      if (habit.isCompleted && habit.completedDate) {
        const completionDate = new Date(habit.completedDate);
        const dayOfWeek = completionDate.getDay();
        pointsByDay[dayOfWeek] += habit.pointsEarned;
      }
    });

    this.chartData.progressByDay.datasets[0].data = pointsByDay;
  }

  // Format category name for display
  formatCategoryName(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  // Get badge icon class
  getBadgeIcon(badge: string): string {
    const icons: Record<string, string> = {
      "eco-starter": "seedling",
      "carbon-reducer": "leaf",
      "energy-saver": "bolt",
      "waste-reducer": "recycle",
      "sustainable-traveler": "bicycle",
      "green-eater": "carrot",
      "eco-master": "award",
    };

    return icons[badge] || "leaf";
  }

  // Get category icon
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      transport: "car",
      energy: "bolt",
      diet: "utensils",
      waste: "trash",
      water: "tint",
      other: "leaf",
    };

    return icons[category] || "leaf";
  }

  // Format date for display
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }

  loadDashboardStats(): void {
    // This would be replaced with an actual API call in production
    // Mock data for demonstration
    this.ecoChallengesCompleted = 12;
    this.carbonSaved = 127;
    this.streakDays = 8;
  }

  // Navigate to a specific route
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
