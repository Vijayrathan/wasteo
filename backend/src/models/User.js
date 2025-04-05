const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    sustainabilityScore: {
      type: Number,
      default: 0,
    },
    greenPoints: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        type: String,
        enum: [
          "eco-starter",
          "carbon-reducer",
          "energy-saver",
          "waste-reducer",
          "sustainable-traveler",
          "green-eater",
          "eco-master",
        ],
      },
    ],
    goalPreferences: {
      diet: {
        type: String,
        enum: ["standard", "flexitarian", "vegetarian", "vegan", "other"],
        default: "standard",
      },
      transport: {
        type: String,
        enum: ["car", "public_transport", "bike", "walk", "mixed"],
        default: "car",
      },
      energyUse: {
        type: String,
        enum: ["standard", "conservative", "minimal", "renewable"],
        default: "standard",
      },
      wasteManagement: {
        type: String,
        enum: ["standard", "recycle", "compost", "zerowaste"],
        default: "standard",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
