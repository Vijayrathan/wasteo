import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, map } from "rxjs";
import { environment } from "../../environments/environment";
import { UserService } from "./user.service";
import { AiService } from "./ai.service";
import { Chat, ChatMessage, ChatResponse } from "../models/chat.model";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/api/chat`;
  private currentChatId?: string;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private aiService: AiService
  ) {}

  // Get chat history for the current user
  getChatHistory(): Observable<ChatMessage[]> {
    const user = this.userService.getCurrentUser();
    if (user && user._id) {
      return this.aiService.getUserChats(user._id).pipe(
        map(chats => {
          // Flatten all messages from all chats into a single array
          const allMessages: ChatMessage[] = [];
          chats.forEach(chat => {
            chat.messages.forEach(msg => {
              allMessages.push({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp
              });
            });
          });
          return allMessages;
        })
      );
    }
    return of([]);
  }

  // Send a message to the AI and get a response
  sendMessage(message: string): Observable<ChatResponse> {
    const user = this.userService.getCurrentUser();
    if (!user || !user._id) {
      return new Observable((observer) => {
        observer.error({ error: { message: "You must be logged in to use the chat." } });
      });
    }

    return this.aiService.chatWithAI(user._id, message, this.currentChatId);
  }

  // Clear chat history
  clearChatHistory(): Observable<any> {
    this.currentChatId = undefined;
    return of(null);
  }

  // Helper method to add messages to local history
  private addToHistory(sender: string, content: string): void {
    // Implementation of addToHistory method
  }

  // Mock responses for demo purposes
  private getMockResponse(userMessage: string): ChatResponse {
    const message = userMessage.toLowerCase();
    let responseText = "";

    if (
      message.includes("carbon footprint") ||
      message.includes("reduce") ||
      message.includes("impact")
    ) {
      responseText =
        "To reduce your carbon footprint, consider:\n\n" +
        "• Using public transportation or carpooling\n" +
        "• Reducing meat consumption, especially beef\n" +
        "• Using energy-efficient appliances\n" +
        "• Insulating your home properly\n" +
        "• Reducing single-use plastics\n\n" +
        "Would you like more specific tips on any of these areas?";
    } else if (
      message.includes("zero waste") ||
      message.includes("shopping") ||
      message.includes("plastic")
    ) {
      responseText =
        "Here are some zero waste shopping tips:\n\n" +
        "• Bring your own reusable bags, including produce bags\n" +
        "• Shop at bulk stores with your own containers\n" +
        "• Choose products with minimal or recyclable packaging\n" +
        "• Buy fresh produce instead of pre-packaged foods\n" +
        "• Plan meals to reduce food waste\n\n" +
        "Did you know? The average person generates about 4.5 pounds of trash every day!";
    } else if (
      message.includes("energy") ||
      message.includes("electricity") ||
      message.includes("home")
    ) {
      responseText =
        "To save energy at home:\n\n" +
        "• Replace regular bulbs with LED lighting\n" +
        "• Use a programmable thermostat to optimize heating/cooling\n" +
        "• Unplug devices when not in use to prevent phantom energy drain\n" +
        "• Wash clothes in cold water when possible\n" +
        "• Ensure your home is properly insulated\n\n" +
        "These changes can reduce your energy bills by up to 30%!";
    } else if (message.includes("compost") || message.includes("food waste")) {
      responseText =
        "Composting at home is easier than you might think!\n\n" +
        "You can start with:\n" +
        "• A small countertop bin for daily scraps\n" +
        "• A larger outdoor bin or tumbler\n" +
        "• Add fruit/vegetable scraps, coffee grounds, eggshells, yard trimmings\n" +
        "• Avoid meat, dairy, and oils\n" +
        "• Turn regularly and maintain proper moisture\n\n" +
        "Finished compost usually takes 2-6 months and provides excellent nutrients for your garden!";
    } else {
      responseText =
        "Thanks for your message! I'm your sustainability assistant and can help with questions about reducing waste, sustainable living practices, carbon footprint reduction, eco-friendly products, and more. What specific sustainability topic would you like to explore?";
    }

    return {
      chatId: "mock-chat-id",
      message: responseText,
      userContext: {
        sustainabilityScore: 65,
        greenPoints: 120,
        badges: ["eco-starter", "waste-reducer"]
      }
    };
  }
}
