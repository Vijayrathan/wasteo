import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserService } from "../../services/user.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string = "";
  loading: boolean = false;
  passwordsMatch: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", [Validators.required]],
    });

    // Check password match on form changes
    this.registerForm.valueChanges.subscribe(() => {
      const password = this.registerForm.get("password")?.value;
      const confirmPassword = this.registerForm.get("confirmPassword")?.value;
      this.passwordsMatch =
        !password || !confirmPassword || password === confirmPassword;
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid || !this.passwordsMatch) {
      return;
    }

    const password = this.registerForm.get("password")?.value;
    const confirmPassword = this.registerForm.get("confirmPassword")?.value;

    if (password !== confirmPassword) {
      this.errorMessage = "Passwords do not match";
      return;
    }

    this.loading = true;
    this.errorMessage = "";

    const { name, email, password: userPassword } = this.registerForm.value;

    this.userService
      .register({ name, email, password: userPassword })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(["/login"], {
            queryParams: { registered: "true" },
          });
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage =
            error.error?.message || "Registration failed. Please try again.";
        },
      });
  }
}
