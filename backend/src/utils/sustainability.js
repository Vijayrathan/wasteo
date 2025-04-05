/**
 * Utility functions for calculating sustainability metrics
 */

// Calculate carbon footprint reduction based on habit category and description
const calculateCarbonReduction = (category, description) => {
  // These are simplified estimates - a real app would use more accurate data
  const baseReductions = {
    transport: 2.5, // kg CO2 saved per day by using public transit instead of car
    energy: 1.5, // kg CO2 saved per day by reducing energy use
    diet: 3.0, // kg CO2 saved per day by eating plant-based instead of meat
    waste: 0.5, // kg CO2 saved per day by recycling/composting
    water: 0.3, // kg CO2 saved per day by reducing water use
  };

  // Get base reduction for category
  let reduction = baseReductions[category] || 0.2;

  // Adjust based on description keywords
  const description_lower = description.toLowerCase();

  if (
    description_lower.includes("bike") ||
    description_lower.includes("walking")
  ) {
    reduction *= 1.5; // More reduction for zero-emission transport
  }

  if (
    description_lower.includes("vegan") ||
    description_lower.includes("vegetarian")
  ) {
    reduction *= 1.3; // More reduction for plant-based diet
  }

  if (
    description_lower.includes("solar") ||
    description_lower.includes("renewable")
  ) {
    reduction *= 2.0; // More reduction for renewable energy
  }

  if (
    description_lower.includes("reuse") ||
    description_lower.includes("zero waste")
  ) {
    reduction *= 1.2; // More reduction for zero waste practices
  }

  return parseFloat(reduction.toFixed(2));
};

// Calculate sustainability score from habits
const calculateSustainabilityScore = (habits, userPreferences) => {
  if (!habits || habits.length === 0) {
    return 25; // Default starting score
  }

  // Base score from preferences
  let score = 25;

  // Add points based on preferences
  if (userPreferences) {
    if (userPreferences.diet === "vegetarian") score += 5;
    if (userPreferences.diet === "vegan") score += 10;

    if (userPreferences.transport === "public_transport") score += 5;
    if (
      userPreferences.transport === "bike" ||
      userPreferences.transport === "walk"
    )
      score += 10;

    if (userPreferences.energyUse === "conservative") score += 5;
    if (userPreferences.energyUse === "renewable") score += 10;

    if (userPreferences.wasteManagement === "recycle") score += 5;
    if (userPreferences.wasteManagement === "zerowaste") score += 10;
  }

  // Count completed habits by category
  const completedHabits = habits.filter((habit) => habit.isCompleted);
  const habitCategories = {};

  completedHabits.forEach((habit) => {
    if (!habitCategories[habit.category]) {
      habitCategories[habit.category] = 0;
    }
    habitCategories[habit.category]++;
  });

  // Add points based on habit completion
  Object.keys(habitCategories).forEach((category) => {
    const count = habitCategories[category];
    score += Math.min(10, count * 2); // Cap at 10 points per category
  });

  // Cap score at 100
  return Math.min(100, Math.round(score));
};

// Calculate points for habit completion
const calculatePointsForHabit = (habit) => {
  const basePoints = {
    transport: 10,
    energy: 8,
    diet: 7,
    waste: 6,
    water: 5,
    other: 3,
  };

  // Get base points for category
  let points = basePoints[habit.category] || basePoints.other;

  // Add bonus points for significant carbon reduction
  if (habit.carbonFootprint > 5) {
    points += 5;
  } else if (habit.carbonFootprint > 2) {
    points += 2;
  }

  return points;
};

// Generate a sustainability tip based on user preferences and habits
const generateSustainabilityTip = (category, preferences) => {
  // These would normally come from a database or more sophisticated algorithm
  const tips = {
    transport: [
      "Try carpooling with colleagues to reduce your commute emissions",
      "Consider using public transportation at least once a week",
      "For short trips under 2 miles, try walking or biking instead of driving",
    ],
    energy: [
      "Unplug electronic devices when not in use to reduce phantom power",
      "Switch to LED light bulbs to reduce energy consumption",
      "Lower your thermostat by 1-2 degrees in winter to save heating energy",
    ],
    diet: [
      "Try having one meat-free day per week to reduce your carbon footprint",
      "Choose locally grown produce to reduce transportation emissions",
      "Consider reducing beef consumption, as it has the highest environmental impact",
    ],
    waste: [
      "Start composting food scraps to reduce methane emissions from landfills",
      "Use reusable bags, bottles, and containers to minimize single-use plastic",
      "Try a zero-waste shopping trip by bringing your own containers",
    ],
    water: [
      "Install low-flow showerheads to reduce water consumption",
      "Collect and use rainwater for watering plants",
      "Fix leaky faucets, which can waste gallons of water daily",
    ],
  };

  // Select a relevant tip based on category
  const categoryTips = tips[category] || tips.energy;
  const randomIndex = Math.floor(Math.random() * categoryTips.length);

  return categoryTips[randomIndex];
};

module.exports = {
  calculateCarbonReduction,
  calculateSustainabilityScore,
  calculatePointsForHabit,
  generateSustainabilityTip,
};
