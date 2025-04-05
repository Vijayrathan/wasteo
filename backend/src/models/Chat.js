const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  role: {
    type: String,
    enum: ["user", "ai"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [messageSchema],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sessionTopic: {
      type: String,
      default: "General Sustainability Chat",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
chatSchema.index({ user: 1, lastMessageAt: -1 });

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
