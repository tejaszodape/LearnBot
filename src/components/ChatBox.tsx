import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  loading: boolean;
  disabled: boolean;
}

export function ChatBox({ messages, onSendMessage, loading, disabled }: ChatBoxProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only scroll to the bottom automatically when the user sends a message (loading starts).
    // This prevents the view from jumping down when the assistant's reply arrives.
    if (loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 flex flex-col h-[500px] transform transition-all duration-300 hover:shadow-2xl">
      {/* Header Section */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
             <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg tracking-wide">AI Tutor</h3>
            <p className="text-sm text-gray-500">Ask anything about the topic</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <h4 className="text-lg font-medium">Start the Conversation</h4>
            <p className="text-sm text-center max-w-xs mt-1">Your chat history will appear here. Ask a question to get started!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 items-start animate-fade-in-up ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-xl px-4 py-3 shadow-sm transition-all ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-3 items-start animate-fade-in-up">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div className="max-w-[75%] rounded-xl px-4 py-3 shadow-sm transition-all bg-white text-gray-800 border border-gray-200 rounded-bl-none">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? "Select a topic to begin..." : "Type your question here..."}
            disabled={disabled || loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-shadow duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || disabled}
            className="px-5 py-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            <span>Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}

