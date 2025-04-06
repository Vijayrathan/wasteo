import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { UserService } from "../../services/user.service";
import { AuthService } from "../../services/auth.service";
import { HabitRefreshService } from "../../services/habit-refresh.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent {
  constructor(
    private userService: UserService, 
    private authService: AuthService,
    private router: Router,
    private habitRefreshService: HabitRefreshService
  ) {}

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  logout(): void {
    console.log("NavbarComponent: Logging out user");
    // Clear user data in both services
    this.userService.logout();
    this.authService.logout();
    
    // Force clear localStorage as a safety measure
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    
    // Notify other components
    this.habitRefreshService.triggerRefresh();
    
    // Navigate to login page
    this.router.navigate(["/login"]);
  }
}
