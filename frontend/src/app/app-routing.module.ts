import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { ChatComponent } from "./components/chat/chat.component";
import { LoginComponent } from "./components/login/login.component";
import { RegisterComponent } from "./components/register/register.component";
import { HabitsListComponent } from "./components/habits-list/habits-list.component";
import { HabitFormComponent } from "./components/habit-form/habit-form.component";
import { FootprintCalculatorComponent } from "./components/footprint-calculator/footprint-calculator.component";

// Import auth guard
import { AuthGuard } from "./guards/auth.guard";

const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard], // Enable auth guard
  },
  {
    path: "chat",
    component: ChatComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "habits",
    component: HabitsListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "habits/new",
    component: HabitFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "habits/edit/:id",
    component: HabitFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "calculator",
    component: FootprintCalculatorComponent,
    canActivate: [AuthGuard],
  },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "**", redirectTo: "/dashboard" }, // Catch-all route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
