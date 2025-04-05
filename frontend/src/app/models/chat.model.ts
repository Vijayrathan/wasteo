export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export interface Chat {
  _id?: string;
  user: string;
  messages: ChatMessage[];
  startedAt: Date;
  lastMessageAt: Date;
  isActive: boolean;
  sessionTopic: string;
}

export interface ChatResponse {
  chatId: string;
  message: string;
  userContext: {
    sustainabilityScore: number;
    greenPoints: number;
    badges: string[];
  };
}

export interface SustainabilityTip {
  title: string;
  description: string;
  carbonReduction: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface FootprintAnalysis {
  description: string;
  footprintAnalysis: string;
  estimatedFootprint: number;
  analysisDate: Date;
}
