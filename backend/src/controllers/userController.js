const User = require("../models/User");

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Register new user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    // In a production app, password should be hashed
    const user = new User({
      username,
      email,
      password, // In production, hash this password
      firstName,
      lastName,
      // Default values for other fields are set in the model
    });

    await user.save();

    // Don't return password
    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password (in production, compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last active
    user.lastActive = Date.now();
    await user.save();

    // Don't return password
    const userResponse = { ...user.toObject() };
    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user sustainability stats
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "sustainabilityScore greenPoints badges"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      sustainabilityScore: user.sustainabilityScore,
      greenPoints: user.greenPoints,
      badges: user.badges,
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user badges
exports.getUserBadges = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("badges");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ badges: user.badges });
  } catch (error) {
    console.error("Error getting user badges:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user preferences
exports.updateUserPreferences = async (req, res) => {
  try {
    const { goalPreferences } = req.body;

    // Update user preferences
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { goalPreferences },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({ message: "Server error" });
  }
};
