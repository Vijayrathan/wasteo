import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <app-navbar></app-navbar>
    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 20px;
        background-color: #f8f9fa;
        min-height: calc(100vh - 60px);
      }
    `,
  ],
})
export class AppComponent {
  title = "EcoWise AI - Personal Sustainability Coach";
}
