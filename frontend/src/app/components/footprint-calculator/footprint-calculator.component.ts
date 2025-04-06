import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-footprint-calculator",
  templateUrl: "./footprint-calculator.component.html",
  styleUrls: ["./footprint-calculator.component.scss"],
})
export class FootprintCalculatorComponent implements OnInit {
  calculatorForm!: FormGroup;
  showResults: boolean = false;
  carbonFootprint: number = 0;
  loading: boolean = false;
  comparisonStats = {
    trees: 0,
    flights: 0,
    driving: 0,
  };

  // Emissions factors (simplified for demo)
  private emissionsFactors = {
    transportation: {
      car: 2.3, // kg CO2 per km
      bus: 0.1, // kg CO2 per km
      train: 0.04, // kg CO2 per km
      plane: 0.25, // kg CO2 per km
    },
    home: {
      electricity: 0.5, // kg CO2 per kWh
      gas: 0.2, // kg CO2 per kWh
      oil: 0.25, // kg CO2 per liter
    },
    food: {
      meat: 6.0, // kg CO2 per meal
      vegetarian: 1.5, // kg CO2 per meal
      vegan: 1.0, // kg CO2 per meal
    },
  };

  constructor(private formBuilder: FormBuilder) {
    this.calculatorForm = this.formBuilder.group({
      // Transportation section
      transportation: this.formBuilder.group({
        carKm: [0, [Validators.required, Validators.min(0)]],
        busKm: [0, [Validators.required, Validators.min(0)]],
        trainKm: [0, [Validators.required, Validators.min(0)]],
        planeKm: [0, [Validators.required, Validators.min(0)]],
      }),

      // Home energy section
      home: this.formBuilder.group({
        electricityKwh: [0, [Validators.required, Validators.min(0)]],
        gasKwh: [0, [Validators.required, Validators.min(0)]],
        oilLiters: [0, [Validators.required, Validators.min(0)]],
      }),

      // Food section
      food: this.formBuilder.group({
        meatMeals: [0, [Validators.required, Validators.min(0)]],
        vegetarianMeals: [0, [Validators.required, Validators.min(0)]],
        veganMeals: [0, [Validators.required, Validators.min(0)]],
      }),
    });
  }

  ngOnInit(): void {
    // Any additional initialization if needed
  }

  calculateFootprint(): void {
    if (this.calculatorForm.invalid) {
      return;
    }

    this.loading = true;

    // Simulate API delay
    setTimeout(() => {
      const formValues = this.calculatorForm.value;

      // Calculate transportation emissions
      const transportEmissions =
        formValues.transportation.carKm *
          this.emissionsFactors.transportation.car +
        formValues.transportation.busKm *
          this.emissionsFactors.transportation.bus +
        formValues.transportation.trainKm *
          this.emissionsFactors.transportation.train +
        formValues.transportation.planeKm *
          this.emissionsFactors.transportation.plane;

      // Calculate home energy emissions
      const homeEmissions =
        formValues.home.electricityKwh *
          this.emissionsFactors.home.electricity +
        formValues.home.gasKwh * this.emissionsFactors.home.gas +
        formValues.home.oilLiters * this.emissionsFactors.home.oil;

      // Calculate food emissions
      const foodEmissions =
        formValues.food.meatMeals * this.emissionsFactors.food.meat +
        formValues.food.vegetarianMeals *
          this.emissionsFactors.food.vegetarian +
        formValues.food.veganMeals * this.emissionsFactors.food.vegan;

      // Calculate total carbon footprint
      this.carbonFootprint = transportEmissions + homeEmissions + foodEmissions;

      // Calculate comparison stats
      this.comparisonStats = {
        trees: Math.round(this.carbonFootprint / 21), // 1 tree absorbs ~21kg CO2 per year
        flights: Math.round(this.carbonFootprint / 500), // 1 flight emits ~500kg CO2
        driving: Math.round(this.carbonFootprint / 2.3 / 100), // Driving 100km emits ~230kg CO2
      };

      this.showResults = true;
      this.loading = false;
    }, 1500);
  }

  resetCalculator(): void {
    this.calculatorForm.reset({
      transportation: {
        carKm: 0,
        busKm: 0,
        trainKm: 0,
        planeKm: 0,
      },
      home: {
        electricityKwh: 0,
        gasKwh: 0,
        oilLiters: 0,
      },
      food: {
        meatMeals: 0,
        vegetarianMeals: 0,
        veganMeals: 0,
      },
    });
    this.showResults = false;
  }
}
