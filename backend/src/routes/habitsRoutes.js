const express = require("express");
const router = express.Router();
const habitsController = require("../controllers/habitsController");

// GET /api/habits - Get all habits for a user
router.get("/", habitsController.getUserHabits);

// GET /api/habits/:id - Get habit by ID
router.get("/:id", habitsController.getHabitById);

// POST /api/habits - Create new habit
router.post("/", habitsController.createHabit);

// PUT /api/habits/:id - Update habit
router.put("/:id", habitsController.updateHabit);

// DELETE /api/habits/:id - Delete habit
router.delete("/:id", habitsController.deleteHabit);

// GET /api/habits/weekly - Get weekly habit summary
router.get("/summary/weekly", habitsController.getWeeklyHabitSummary);

// GET /api/habits/categories - Get habits by category
router.get("/categories/:category", habitsController.getHabitsByCategory);

// POST /api/habits/:id/complete - Mark habit as completed
router.post("/:id/complete", habitsController.completeHabit);

module.exports = router;
