import { useState } from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface TestViewProps {
  questions: Question[];
  loading: boolean;
  onComplete: (score: number) => void;
}

export function TestView({ questions, loading, onComplete }: TestViewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600">Generating quiz questions...</p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileQuestion className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>Select a subject and topic to start the test</p>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const selectedAnswer = selectedAnswers[currentQuestion];

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const score = Math.round(
        (selectedAnswers.filter((ans, idx) => ans === questions[idx].correct).length / questions.length) * 100
      );
      setScore(score); 
      setTestComplete(true);
      onComplete(score);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setShowFeedback(false);
    }
  };

 if (testComplete && score !== null) {
  const correctCount = selectedAnswers.filter((ans, idx) => ans === questions[idx].correct).length;

  return (
    <div className="text-center py-12">
      <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
        score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
      }`}>
        <span className={`text-4xl font-bold ${
          score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {score}%
        </span>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Test Complete!</h3>
      <p className="text-gray-600 mb-6">
        You got {correctCount} out of {questions.length} questions correct.
      </p>
      <button
        onClick={() => {
          setCurrentQuestion(0);
          setSelectedAnswers([]);
          setShowFeedback(false);
          setTestComplete(false);
          setScore(null);
        }}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Retake Test
      </button>
    </div>
  );
}


  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">
          Question {currentQuestion + 1} of {questions.length}
        </span>
        <div className="flex gap-1">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full ${
                idx < currentQuestion
                  ? 'bg-blue-600'
                  : idx === currentQuestion
                  ? 'bg-blue-400'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">{question.question}</h3>

        <div className="space-y-3 mb-6">
          {question.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedAnswer === letter;
            const isCorrect = letter === question.correct;
            const showCorrect = showFeedback && isCorrect;
            const showIncorrect = showFeedback && isSelected && !isCorrect;

            return (
              <button
                key={idx}
                onClick={() => {
                  if (!showFeedback) {
                    const newAnswers = [...selectedAnswers];
                    newAnswers[currentQuestion] = letter;
                    setSelectedAnswers(newAnswers);
                  }
                }}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  showCorrect
                    ? 'border-green-500 bg-green-50'
                    : showIncorrect
                    ? 'border-red-500 bg-red-50'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                } ${showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    showCorrect
                      ? 'bg-green-600 text-white'
                      : showIncorrect
                      ? 'bg-red-600 text-white'
                      : isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {letter}
                  </span>
                  <span className="flex-1 pt-1">{option}</span>
                  {showCorrect && <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />}
                  {showIncorrect && <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className={`p-4 rounded-lg mb-6 ${
            selectedAnswer === question.correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`font-semibold mb-2 ${
              selectedAnswer === question.correct ? 'text-green-900' : 'text-red-900'
            }`}>
              {selectedAnswer === question.correct ? 'Correct!' : 'Incorrect'}
            </p>
            <p className="text-sm text-gray-700">{question.explanation}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {!showFeedback ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isLastQuestion ? 'Finish Test' : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function FileQuestion({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
