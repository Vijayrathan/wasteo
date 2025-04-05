const mongoose = require("mongoose");
const { Schema } = mongoose;

const habitSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      enum: ["transport", "energy", "diet", "waste", "water", "other"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    carbonFootprint: {
      type: Number,
      default: 0,
    },
    sustainableAlternative: {
      type: String,
      default: "",
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries by user and date
habitSchema.index({ user: 1, date: -1 });

const Habit = mongoose.model("Habit", habitSchema);

module.exports = Habit;
