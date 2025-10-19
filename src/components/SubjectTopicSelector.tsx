import { useEffect, useState } from 'react';
import { SUBJECTS, SUBJECTS_DATA } from '../data/subjects';
import { ChevronDown } from 'lucide-react';

interface SubjectTopicSelectorProps {
  onSelectionChange: (subject: string | null, topic: string | null) => void;
}

export function SubjectTopicSelector({ onSelectionChange }: SubjectTopicSelectorProps) {
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  useEffect(() => {
    if (selectedSubject) {
      setTopics(SUBJECTS_DATA[selectedSubject as keyof typeof SUBJECTS_DATA] || []);
      setSelectedTopic('');
    } else {
      setTopics([]);
      setSelectedTopic('');
    }
  }, [selectedSubject]);

  useEffect(() => {
    onSelectionChange(selectedSubject || null, selectedTopic || null);
  }, [selectedSubject, selectedTopic, onSelectionChange]);

  return (
    <div className="flex flex-wrap gap-4">
      <div className="relative">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="appearance-none h-12 pl-4 pr-10 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium text-gray-700 cursor-pointer hover:border-gray-400 transition-colors min-w-[200px]"
        >
          <option value="">Select Subject</option>
          {SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
      </div>

      <div className="relative">
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          disabled={!selectedSubject}
          className="appearance-none h-12 pl-4 pr-10 bg-white border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium text-gray-700 cursor-pointer hover:border-gray-400 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 min-w-[200px]"
        >
          <option value="">Select Topic</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}
