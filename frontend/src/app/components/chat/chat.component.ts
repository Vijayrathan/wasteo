import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../../services/user.service";
import { ChatService } from "../../services/chat.service";
import { ChatMessage } from "../../models/chat.model";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit {
  @ViewChild('chatMessages') chatMessages!: ElementRef;

  chatForm!: FormGroup;
  messages: ChatMessage[] = [];
  loading: boolean = false;
  userName: string = "";

  // Sample eco-tips for quick suggestions
  ecoTips: string[] = [
    "How can I reduce my carbon footprint?",
    "Give me tips for zero waste shopping",
    "What are sustainable alternatives to plastic?",
    "How can I save energy at home?",
    "Tell me about composting at home",
  ];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private chatService: ChatService
  ) {
    this.chatForm = this.formBuilder.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const user = this.userService.getCurrentUser();
    if (user) {
      this.userName = user.name;
      this.loadChatHistory();
    }

    // Welcome message
    this.addMessage(
      "Hello! I'm your EcoWise AI assistant. How can I help you with your sustainability journey today?",
      "ai"
    );
  }

  loadChatHistory(): void {
    this.loading = true;
    this.chatService.getChatHistory().subscribe({
      next: (history) => {
        if (history && history.length > 0) {
          // Add previous messages to chat
          history.forEach((msg) => {
            this.messages.push({
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.timestamp),
            });
          });

          setTimeout(() => this.scrollToBottom(), 100);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error("Error loading chat history:", error);
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.chatForm.invalid) {
      return;
    }

    const messageControl = this.chatForm.get("message");
    if (!messageControl) {
      return;
    }

    const userMessage = messageControl.value;
    this.addMessage(userMessage, "user");
    this.chatForm.reset();

    // Send message to API
    this.loading = true;
    this.chatService.sendMessage(userMessage).subscribe({
      next: (response) => {
        this.addMessage(response.message, "ai");
        this.loading = false;
      },
      error: (error) => {
        console.error("Error sending message:", error);
        this.addMessage(
          "Sorry, I encountered an error processing your request. Please try again later.",
          "ai"
        );
        this.loading = false;
      },
    });
  }

  addMessage(content: string, role: "user" | "ai"): void {
    const message: ChatMessage = {
      content,
      role,
      timestamp: new Date(),
    };

    this.messages.push(message);
    setTimeout(() => this.scrollToBottom(), 100);
  }

  scrollToBottom(): void {
    try {
      this.chatMessages.nativeElement.scrollTop =
        this.chatMessages.nativeElement.scrollHeight;
    } catch (err) {
      console.error("Error scrolling to bottom:", err);
    }
  }

  selectQuickTip(tip: string): void {
    this.chatForm.patchValue({ message: tip });
  }

  clearChat(): void {
    this.messages = [];
    this.addMessage(
      "Chat cleared. How else can I help you with your sustainability journey?",
      "ai"
    );

    // Clear chat history in the backend
    this.chatService.clearChatHistory().subscribe({
      error: (error) => console.error("Error clearing chat history:", error),
    });
  }
}
