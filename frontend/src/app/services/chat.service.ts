import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { environment } from "../../environments/environment";
import { UserService } from "./user.service";

interface ChatMessage {
  _id?: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  reply: string;
  chatId?: string;
}

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/api/chat`;

  // For demo purposes: store chat history locally
  private chatHistory: ChatMessage[] = [];

  constructor(private http: HttpClient, private userService: UserService) {}

  // Get chat history for the current user
  getChatHistory(): Observable<ChatMessage[]> {
    // In a real app, this would fetch from the backend
    if (this.userService.isLoggedIn()) {
      // For now, return the locally stored history for demo
      return of(this.chatHistory);

      // When backend is ready:
      // return this.http.get<ChatMessage[]>(`${this.apiUrl}/history`);
    }
    return of([]);
  }

  // Send a message to the AI and get a response
  sendMessage(message: string): Observable<ChatResponse> {
    // Add user message to local history
    this.addToHistory("user", message);

    // In a real app, this would send to the backend
    // For demo, we can use a mock response
    if (this.userService.isLoggedIn()) {
      // Simulate API delay
      return new Observable<ChatResponse>((observer) => {
        setTimeout(() => {
          const mockResponse = this.getMockResponse(message);
          // Add AI response to local history
          this.addToHistory("ai", mockResponse.reply);

          observer.next(mockResponse);
          observer.complete();
        }, 1500);
      });

      // When backend is ready:
      // return this.http.post<ChatResponse>(`${this.apiUrl}/message`, { message });
    }

    // If not logged in, return error
    return new Observable<ChatResponse>((observer) => {
      observer.error({
        error: { message: "You must be logged in to use the chat." },
      });
    });
  }

  // Clear chat history
  clearChatHistory(): Observable<any> {
    // Clear local history
    this.chatHistory = [];

    // In a real app, this would clear history in the backend
    // return this.http.delete(`${this.apiUrl}/history`);

    return of({ success: true });
  }

  // Helper method to add messages to local history
  private addToHistory(sender: string, content: string): void {
    this.chatHistory.push({
      sender,
      content,
      timestamp: new Date(),
    });
  }

  // Mock responses for demo purposes
  private getMockResponse(userMessage: string): ChatResponse {
    const message = userMessage.toLowerCase();
    let reply = "";

    if (
      message.includes("carbon footprint") ||
      message.includes("reduce") ||
      message.includes("impact")
    ) {
      reply =
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
      reply =
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
      reply =
        "To save energy at home:\n\n" +
        "• Replace regular bulbs with LED lighting\n" +
        "• Use a programmable thermostat to optimize heating/cooling\n" +
        "• Unplug devices when not in use to prevent phantom energy drain\n" +
        "• Wash clothes in cold water when possible\n" +
        "• Ensure your home is properly insulated\n\n" +
        "These changes can reduce your energy bills by up to 30%!";
    } else if (message.includes("compost") || message.includes("food waste")) {
      reply =
        "Composting at home is easier than you might think!\n\n" +
        "You can start with:\n" +
        "• A small countertop bin for daily scraps\n" +
        "• A larger outdoor bin or tumbler\n" +
        "• Add fruit/vegetable scraps, coffee grounds, eggshells, yard trimmings\n" +
        "• Avoid meat, dairy, and oils\n" +
        "• Turn regularly and maintain proper moisture\n\n" +
        "Finished compost usually takes 2-6 months and provides excellent nutrients for your garden!";
    } else {
      reply =
        "Thanks for your message! I'm your sustainability assistant and can help with questions about reducing waste, sustainable living practices, carbon footprint reduction, eco-friendly products, and more. What specific sustainability topic would you like to explore?";
    }

    return { reply };
  }
}
