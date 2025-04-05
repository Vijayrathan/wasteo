export interface UserPreferences {
  diet: "standard" | "flexitarian" | "vegetarian" | "vegan" | "other";
  transport: "car" | "public_transport" | "bike" | "walk" | "mixed";
  energyUse: "standard" | "conservative" | "minimal" | "renewable";
  wasteManagement: "standard" | "recycle" | "compost" | "zerowaste";
}

export interface User {
  _id?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  sustainabilityScore: number;
  greenPoints: number;
  badges: string[];
  goalPreferences: UserPreferences;
  createdAt?: Date;
  lastActive?: Date;
}

export interface UserStats {
  sustainabilityScore: number;
  greenPoints: number;
  badges: string[];
}

export interface AuthResponse {
  user: User;
  token?: string;
}
