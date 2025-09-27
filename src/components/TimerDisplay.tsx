import React from 'react';
import { Clock, Pause, Play } from 'lucide-react';

interface TimerDisplayProps {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  progress: number;
  onPause: () => void;
  onResume: () => void;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timeRemaining,
  isRunning,
  isPaused,
  difficulty,
  progress,
  onPause,
  onResume,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'hard':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = () => {
    if (timeRemaining <= 10) return 'bg-red-500';
    if (timeRemaining <= 30) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-600" />
        <span className="text-lg font-mono font-semibold">
          {formatTime(timeRemaining)}
        </span>
      </div>
      
      <div className="flex-1">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor()}`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </div>

      <button
        onClick={isPaused ? onResume : onPause}
        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        {isPaused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
};

export default TimerDisplay;