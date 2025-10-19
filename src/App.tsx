import { useState, useEffect, useCallback } from 'react';
import { Mode, ChatMessage, Question } from './types';
import { SubjectTopicSelector } from './components/SubjectTopicSelector';
import { ModeToggle } from './components/ModeToggle';
import { LearnView } from './components/LearnView';
import { TestView } from './components/TestView';
import { ChatBox } from './components/ChatBox';
import { fetchLearnContent, fetchTestQuestions, askQuestion } from './lib/api';
import { GraduationCap } from 'lucide-react';

function App() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('learn');
  const [learnContent, setLearnContent] = useState('');
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [messageIdCounter, setMessageIdCounter] = useState(0);

  const loadContent = useCallback(async () => {
    if (!selectedSubject || !selectedTopic) return;

    setLoading(true);
    setLearnContent('');
    setTestQuestions([]);
    
    try {
      if (mode === 'learn') {
        const content = await fetchLearnContent(selectedSubject, selectedTopic);
        setLearnContent(content);
      } else {
        const questions = await fetchTestQuestions(selectedSubject, selectedTopic);
        setTestQuestions(questions);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      if (mode === 'learn') {
        setLearnContent(`Failed to load content: ${(error as Error).message}. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedTopic, mode]);

  useEffect(() => {
    if (selectedSubject && selectedTopic) {
      loadContent();
    } else {
      setLearnContent('');
      setTestQuestions([]);
      setChatMessages([]);
    }
  }, [selectedSubject, selectedTopic, mode, loadContent]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!selectedSubject || !selectedTopic) return;

      const newId = messageIdCounter;
      setMessageIdCounter((prev) => prev + 2);

      const userMessage: ChatMessage = {
        id: newId.toString(),
        role: 'user',
        content: message,
        timestamp: new Date()
      };

      setChatMessages((prev) => [...prev, userMessage]);
      setChatLoading(true);

      try {
        const answer = await askQuestion(selectedSubject, selectedTopic, message);
        const assistantMessage: ChatMessage = {
          id: (newId + 1).toString(),
          role: 'assistant',
          content: answer,
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error getting answer:', error);
        const errorMessage: ChatMessage = {
          id: (newId + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, errorMessage]);
      } finally {
        setChatLoading(false);
      }
    },
    [selectedSubject, selectedTopic, messageIdCounter]
  );

  const handleSelectionChange = useCallback(
    (subject: string | null, topic: string | null) => {
      setSelectedSubject(subject);
      setSelectedTopic(topic);
      setChatMessages([]);
    },
    []
  );

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-10 w-full bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">LearnBot</h1>
            </div>
            <p className="hidden md:block text-sm text-slate-500">Your AI-Powered Computer Science Tutor</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <SubjectTopicSelector onSelectionChange={handleSelectionChange} />
            <div className="flex-shrink-0">
              <ModeToggle
                mode={mode}
                onModeChange={setMode}
                disabled={!selectedSubject || !selectedTopic}
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            {mode === 'learn' ? (
              <LearnView content={learnContent} loading={loading} />
            ) : (
              <TestView
                questions={testQuestions}
                loading={loading}
                 onComplete={(score) => {
                 console.log('Test complete! Score:', score);}} 
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <ChatBox
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              loading={chatLoading}
              disabled={!selectedSubject || !selectedTopic}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

