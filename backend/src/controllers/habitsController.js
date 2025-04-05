const Habit = require("../models/Habit");
const User = require("../models/User");

// Get all habits for a user
exports.getUserHabits = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const habits = await Habit.find({ user: userId }).sort({ date: -1 });
    res.status(200).json(habits);
  } catch (error) {
    console.error("Error getting user habits:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get habit by ID
exports.getHabitById = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.status(200).json(habit);
  } catch (error) {
    console.error("Error getting habit:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new habit
exports.createHabit = async (req, res) => {
  try {
    const {
      userId,
      category,
      description,
      carbonFootprint,
      sustainableAlternative,
    } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new habit
    const habit = new Habit({
      user: userId,
      category,
      description,
      carbonFootprint: carbonFootprint || 0,
      sustainableAlternative: sustainableAlternative || "",
      pointsEarned: 0, // Start with 0 points
      isCompleted: false, // Start as not completed
    });

    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    console.error("Error creating habit:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update habit
exports.updateHabit = async (req, res) => {
  try {
    const { category, description, carbonFootprint, sustainableAlternative } =
      req.body;

    // Find and update habit
    const habit = await Habit.findByIdAndUpdate(
      req.params.id,
      {
        category,
        description,
        carbonFootprint,
        sustainableAlternative,
      },
      { new: true }
    );

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.status(200).json(habit);
  } catch (error) {
    console.error("Error updating habit:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete habit
exports.deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    res.status(200).json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error("Error deleting habit:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Complete habit and award points
exports.completeHabit = async (req, res) => {
  try {
    // Find the habit
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    if (habit.isCompleted) {
      return res.status(400).json({ message: "Habit already completed" });
    }

    // Calculate points based on habit category and carbon footprint reduction
    // This is a simplified calculation - in a real app, this would be more sophisticated
    let pointsEarned = 0;

    switch (habit.category) {
      case "transport":
        pointsEarned = 10;
        break;
      case "energy":
        pointsEarned = 8;
        break;
      case "diet":
        pointsEarned = 7;
        break;
      case "waste":
        pointsEarned = 6;
        break;
      case "water":
        pointsEarned = 5;
        break;
      default:
        pointsEarned = 3;
    }

    // Add bonus points if a large carbon footprint reduction
    if (habit.carbonFootprint > 5) {
      pointsEarned += 5;
    }

    // Update habit
    habit.isCompleted = true;
    habit.completedDate = Date.now();
    habit.pointsEarned = pointsEarned;
    await habit.save();

    // Update user's green points and sustainability score
    const user = await User.findById(habit.user);
    user.greenPoints += pointsEarned;

    // Simple formula to update sustainability score based on points
    // In a real app, this would use more factors
    user.sustainabilityScore = Math.min(
      100,
      user.sustainabilityScore + pointsEarned / 10
    );

    // Check if user earned any new badges
    if (user.greenPoints >= 100 && !user.badges.includes("eco-starter")) {
      user.badges.push("eco-starter");
    }
    if (user.greenPoints >= 300 && !user.badges.includes("carbon-reducer")) {
      user.badges.push("carbon-reducer");
    }
    if (user.greenPoints >= 500 && !user.badges.includes("eco-master")) {
      user.badges.push("eco-master");
    }

    await user.save();

    res.status(200).json({
      habit,
      pointsEarned,
      totalPoints: user.greenPoints,
      newSustainabilityScore: user.sustainabilityScore,
      badges: user.badges,
    });
  } catch (error) {
    console.error("Error completing habit:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get weekly habit summary
exports.getWeeklyHabitSummary = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get date from 7 days ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Find all habits in the last week
    const habits = await Habit.find({
      user: userId,
      date: { $gte: oneWeekAgo },
    }).sort({ date: -1 });

    // Calculate stats
    const stats = {
      totalHabits: habits.length,
      completedHabits: habits.filter((h) => h.isCompleted).length,
      pointsEarned: habits.reduce((sum, h) => sum + h.pointsEarned, 0),
      carbonFootprint: habits.reduce((sum, h) => sum + h.carbonFootprint, 0),
      habitsByCategory: {},
    };

    // Group habits by category
    habits.forEach((habit) => {
      if (!stats.habitsByCategory[habit.category]) {
        stats.habitsByCategory[habit.category] = 0;
      }
      stats.habitsByCategory[habit.category]++;
    });

    res.status(200).json({
      habits,
      stats,
    });
  } catch (error) {
    console.error("Error getting weekly summary:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get habits by category
exports.getHabitsByCategory = async (req, res) => {
  try {
    const userId = req.query.userId;
    const { category } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const habits = await Habit.find({
      user: userId,
      category,
    }).sort({ date: -1 });

    res.status(200).json(habits);
  } catch (error) {
    console.error("Error getting habits by category:", error);
    res.status(500).json({ message: "Server error" });
  }
};
