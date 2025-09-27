import React from 'react';
import { Clock, Play, RotateCcw } from 'lucide-react';
import { Candidate } from '../types';

interface WelcomeBackModalProps {
  candidate: Candidate;
  onContinue: () => void;
  onRestart: () => void;
}

const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({ candidate, onContinue, onRestart }) => {
  const getProgressPercentage = () => {
    return Math.round((candidate.answers.length / 6) * 100);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLastActivity = () => {
    if (candidate.answers.length === 0) {
      return 'Resume uploaded, information collected';
    }
    return `Answered ${candidate.answers.length} out of 6 questions`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back, {candidate.name}!
            </h2>
            <p className="text-gray-600">
              We found your previous interview session
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Session Details</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Started:</span>
                <span className="text-gray-900">{formatDate(candidate.startedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Progress:</span>
                <span className="text-gray-900">{getProgressPercentage()}% complete</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last activity:</span>
                <span className="text-gray-900">{getLastActivity()}</span>
              </div>
              {candidate.currentQuestionIndex < 6 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Next question:</span>
                  <span className="text-gray-900">Question {candidate.currentQuestionIndex + 1}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{candidate.answers.length}/6 questions</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onRestart}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Start Over
            </button>
            
            <button
              onClick={onContinue}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="w-5 h-5" />
              Continue
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your progress is automatically saved. You can continue where you left off or start fresh.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackModal;