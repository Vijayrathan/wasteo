import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ChatResponse, Chat, FootprintAnalysis } from "../models/chat.model";
import { environment } from "../../environments/environment";
import { HabitCategory } from "../models/habit.model";

@Injectable({
  providedIn: "root",
})
export class AiService {
  private apiUrl = `${environment.apiUrl}/api/ai`;

  constructor(private http: HttpClient) {}

  // Chat with AI assistant
  chatWithAI(
    userId: string,
    message: string,
    chatId?: string
  ): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, {
      userId,
      message,
      chatId,
    });
  }

  // Get all chats for a user
  getUserChats(userId: string): Observable<Chat[]> {
    return this.http.get<Chat[]>(`${this.apiUrl}/chats`, {
      params: { userId },
    });
  }

  // Get a specific chat by ID
  getChatById(chatId: string): Observable<Chat> {
    return this.http.get<Chat>(`${this.apiUrl}/chats/${chatId}`);
  }

  // Analyze user habits
  analyzeHabits(userId: string): Observable<{
    analysis: string;
    userProfile: {
      sustainabilityScore: number;
      greenPoints: number;
      badges: string[];
    };
    habitCount: number;
  }> {
    return this.http.post<{
      analysis: string;
      userProfile: {
        sustainabilityScore: number;
        greenPoints: number;
        badges: string[];
      };
      habitCount: number;
    }>(`${this.apiUrl}/analyze-habits`, { userId });
  }

  // Get sustainability suggestions
  getSuggestions(
    userId: string,
    category?: HabitCategory
  ): Observable<{
    suggestions: string;
    category: string;
    userProfile: {
      sustainabilityScore: number;
      greenPoints: number;
    };
  }> {
    const payload: any = { userId };
    if (category) {
      payload.category = category;
    }

    return this.http.post<{
      suggestions: string;
      category: string;
      userProfile: {
        sustainabilityScore: number;
        greenPoints: number;
      };
    }>(`${this.apiUrl}/suggestions`, payload);
  }

  // Calculate carbon footprint
  calculateFootprint(
    userId: string,
    description: string
  ): Observable<FootprintAnalysis> {
    return this.http.post<FootprintAnalysis>(
      `${this.apiUrl}/calculate-footprint`,
      {
        userId,
        description,
      }
    );
  }

  // Parse sustainability tips from text
  parseSustainabilityTips(tipsText: string): any[] {
    // This is a simplified parser - a real implementation would be more robust
    if (!tipsText) return [];

    const tips = [];
    // Split on numbered list patterns (1., 2., etc)
    const tipSections = tipsText.split(/\d+\.\s+/);

    for (const section of tipSections) {
      if (section.trim().length === 0) continue;

      // Try to extract title, description and other details
      const lines = section
        .split("\n")
        .filter((line) => line.trim().length > 0);
      if (lines.length >= 2) {
        const tip = {
          title: lines[0].trim(),
          description: lines[1].trim(),
          carbonReduction: this.extractCarbonValue(section),
          difficulty: this.extractDifficulty(section),
        };
        tips.push(tip);
      }
    }

    return tips;
  }

  // Helper to extract carbon value from text
  private extractCarbonValue(text: string): number {
    const match = text.match(
      /(\d+(\.\d+)?)\s*(kg|kilograms?)\s*(of)?\s*(CO2|carbon dioxide)/i
    );
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
    return 0;
  }

  // Helper to extract difficulty level from text
  private extractDifficulty(text: string): "Easy" | "Medium" | "Hard" {
    if (text.includes("Easy")) return "Easy";
    if (text.includes("Medium")) return "Medium";
    if (text.includes("Hard")) return "Hard";
    return "Medium"; // Default
  }
}
