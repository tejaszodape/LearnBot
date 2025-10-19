import { CheckCircle, Loader2, BookOpen, BrainCircuit } from 'lucide-react';

interface LearnViewProps {
  content: string;
  loading: boolean;
}

export function LearnView({ content, loading }: LearnViewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 flex flex-col h-[500px] transform transition-all duration-300 hover:shadow-2xl">
      {/* Header Section */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg tracking-wide">Learning Content</h3>
            <p className="text-sm text-gray-500">Read the generated content below</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-lg font-medium">Generating Learning Content...</p>
            <p className="text-sm">Please wait a moment.</p>
          </div>
        )}

        {!loading && !content && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
             <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <h4 className="text-lg font-medium">Ready to Learn?</h4>
            <p className="text-sm text-center max-w-xs mt-1">Select a subject and topic from the dropdowns to generate educational content.</p>
          </div>
        )}

        {!loading && content && (
           <div className="prose prose-indigo max-w-none animate-fade-in-up">
            <div className="flex items-start gap-3 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="w-7 h-7 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-800">Learning Mode Activated</strong>
                <p className="text-sm text-blue-700 mt-1">
                  Read through the material below. If you have any questions, use the AI Tutor chat!
                </p>
              </div>
            </div>
            {/* The whitespace-pre-wrap is important for preserving formatting from the API response */}
            <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
          </div>
        )}
      </div>
    </div>
  );
}
