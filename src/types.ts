export interface Question {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type Mode = 'learn' | 'test';
