import React from 'react';
import { ArrowLeft, User, Mail, Phone, Clock, Star, CheckCircle, XCircle } from 'lucide-react';
import { Candidate } from '../types';

interface CandidateDetailsProps {
  candidate: Candidate;
  onBack: () => void;
}

const CandidateDetails: React.FC<CandidateDetailsProps> = ({ candidate, onBack }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getOverallScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const duration = Math.floor((end.getTime() - startTime.getTime()) / 60000);
    return `${duration} minutes`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
          <p className="text-gray-600">Candidate Details & Performance Review</p>
        </div>

        <div className={`text-3xl font-bold ${getOverallScoreColor(candidate.score)}`}>
          {candidate.score}/100
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Profile */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Candidate Profile
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
              <p className="text-gray-900">{candidate.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{candidate.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{candidate.phone}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Interview Status</label>
              <div className="flex items-center gap-2">
                {candidate.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className="capitalize">{candidate.status.replace('_', ' ')}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Started At</label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">
                  {candidate.startedAt.toLocaleDateString()} at {candidate.startedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {candidate.completedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Duration</label>
                <p className="text-gray-900">
                  {formatDuration(candidate.startedAt, candidate.completedAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Performance Summary
          </h2>

          {candidate.summary ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700 leading-relaxed">{candidate.summary}</p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">Interview in progress or summary not yet generated.</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getOverallScoreColor(candidate.score)}`}>
                {candidate.score}
              </div>
              <div className="text-sm text-gray-500">Overall Score</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {candidate.answers.length}/6
              </div>
              <div className="text-sm text-gray-500">Questions Answered</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {candidate.answers.length > 0 
                  ? Math.round(candidate.answers.reduce((sum, a) => sum + a.score, 0) / candidate.answers.length)
                  : 0
                }
              </div>
              <div className="text-sm text-gray-500">Avg Question Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions & Answers */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Questions & Answers</h2>
        </div>

        {candidate.answers.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {candidate.answers.map((answer, index) => (
              <div key={answer.questionId} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-gray-500">
                        Question {index + 1}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(answer.difficulty)}`}>
                        {answer.difficulty.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {answer.timeLimit}s limit
                      </span>
                    </div>
                    <h3 className="text-base font-medium text-gray-900 mb-3">
                      {answer.question}
                    </h3>
                  </div>
                  
                  <div className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(answer.score)}`}>
                    {answer.score}/10
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Candidate's Answer
                    </label>
                    <div className="bg-gray-50 rounded-lg p-3 min-h-[100px]">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {answer.answer || 'No answer provided'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Feedback
                    </label>
                    <div className="bg-blue-50 rounded-lg p-3 min-h-[100px]">
                      <p className="text-blue-800">{answer.feedback}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                  <span>Time Used: {answer.timeUsed}s / {answer.timeLimit}s</span>
                  <span>
                    Efficiency: {Math.round((1 - answer.timeUsed / answer.timeLimit) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Answered Yet</h3>
            <p className="text-gray-500">
              This candidate hasn't answered any questions yet. Check back later or contact them directly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDetails;