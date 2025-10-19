import { BookOpen, FileQuestion } from 'lucide-react';
import { Mode } from '../types';

interface ModeToggleProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  disabled: boolean;
}

export function ModeToggle({ mode, onModeChange, disabled }: ModeToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
      <button
        onClick={() => onModeChange('learn')}
        disabled={disabled}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          mode === 'learn'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <BookOpen className="w-5 h-5" />
        Learn
      </button>
      <button
        onClick={() => onModeChange('test')}
        disabled={disabled}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          mode === 'test'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <FileQuestion className="w-5 h-5" />
        Test
      </button>
    </div>
  );
}
