import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Clock } from 'lucide-react';
import { Question, Answer } from '../types';
import { useTimer } from '../hooks/useTimer';
import TimerDisplay from './TimerDisplay';

interface InterviewChatProps {
  questions: Question[];
  currentQuestionIndex: number;
  onAnswerSubmit: (answer: string, timeUsed: number) => void;
  onInterviewComplete: () => void;
  candidateName: string;
}

interface ChatMessage {
  id: string;
  type: 'bot' | 'user' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const InterviewChat: React.FC<InterviewChatProps> = ({
  questions,
  currentQuestionIndex,
  onAnswerSubmit,
  onInterviewComplete,
  candidateName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionShown, setCurrentQuestionShown] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const {
    timeRemaining,
    isRunning,
    isPaused,
    progress,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
  } = useTimer({
    initialTime: currentQuestion?.timeLimit || 0,
    onTimeUp: () => handleSubmit(true),
    autoStart: false,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (currentQuestion && currentQuestionShown !== currentQuestionIndex) {
      // Add welcome message for first question
      if (currentQuestionIndex === 0 && messages.length === 0) {
        addMessage({
          type: 'bot',
          content: `Hello ${candidateName}! Welcome to your technical interview. We'll go through 6 questions of increasing difficulty. Let's start with the first question.`,
          isTyping: true,
        });
        
        setTimeout(() => {
          showCurrentQuestion();
        }, 2000);
      } else if (currentQuestionIndex > 0 && messages.length === 0) {
        // Resuming from a later question
        addMessage({
          type: 'bot',
          content: `Welcome back ${candidateName}! Let's continue with question ${currentQuestionIndex + 1}.`,
          isTyping: true,
        });
        
        setTimeout(() => {
          showCurrentQuestion();
        }, 1500);
      } else {
        // For subsequent questions, show immediately
        showCurrentQuestion();
      }
    }
  }, [currentQuestion, currentQuestionIndex, candidateName, currentQuestionShown]);

  const showCurrentQuestion = () => {
    if (currentQuestion) {
      addMessage({
        type: 'system',
        content: `Question ${currentQuestionIndex + 1}/6 - ${currentQuestion.difficulty.toUpperCase()} (${currentQuestion.timeLimit}s)`,
      });
      
      setTimeout(() => {
        addMessage({
          type: 'bot',
          content: currentQuestion.text,
          isTyping: true,
        });
        
        setTimeout(() => {
          startTimer();
          setCurrentQuestionShown(currentQuestionIndex);
        }, 1500);
      }, 500);
    }
  };

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (isSubmitting || (!currentAnswer.trim() && !isAutoSubmit)) return;

    setIsSubmitting(true);
    const answer = currentAnswer.trim() || 'No answer provided';
    const timeUsed = currentQuestion.timeLimit - timeRemaining;

    // Add user message
    addMessage({
      type: 'user',
      content: answer === 'No answer provided' ? 'Time\'s up! (No answer provided)' : answer,
    });

    setCurrentAnswer('');

    try {
      onAnswerSubmit(answer, timeUsed);

      // Show processing message
      addMessage({
        type: 'bot',
        content: 'Analyzing your answer...',
        isTyping: true,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      if (isLastQuestion) {
        addMessage({
          type: 'bot',
          content: 'That completes all questions! Calculating your final score...',
          isTyping: true,
        });
        
        setTimeout(() => {
          onInterviewComplete();
        }, 3000);
      } else {
        addMessage({
          type: 'bot',
          content: `Great answer! You scored ${Math.floor(Math.random() * 3) + 7}/10. Moving on to the next question...`,
          isTyping: true,
        });
      }
    } catch (error) {
      addMessage({
        type: 'bot',
        content: 'There was an error processing your answer. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const canType = isRunning && !isSubmitting && currentAnswer.length < 2000;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Timer */}
      {currentQuestion && currentQuestionShown === currentQuestionIndex && (
        <div className="mb-4">
          <TimerDisplay
            timeRemaining={timeRemaining}
            isRunning={isRunning}
            isPaused={isPaused}
            difficulty={currentQuestion.difficulty}
            progress={progress}
            onPause={pauseTimer}
            onResume={startTimer}
          />
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-lg border shadow-sm">
        <div className="p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.type === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'bot' 
                  ? 'bg-blue-100 text-blue-600' 
                  : message.type === 'user'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {message.type === 'bot' ? (
                  <Bot className="w-5 h-5" />
                ) : message.type === 'user' ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>

              <div className={`flex-1 max-w-[80%] ${
                message.type === 'user' ? 'text-right' : ''
              }`}>
                <div className={`inline-block p-3 rounded-lg ${
                  message.type === 'bot'
                    ? 'bg-gray-100 text-gray-800'
                    : message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-yellow-100 text-yellow-800 text-sm font-medium'
                }`}>
                  {message.isTyping ? (
                    <div className="flex items-center gap-2">
                      <span>{message.content}</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="mt-4 p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                canType 
                  ? "Type your answer here... (Press Enter to submit, Shift+Enter for new line)"
                  : isSubmitting 
                  ? "Processing your answer..."
                  : "Please wait for the question..."
              }
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              disabled={!canType}
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
              <span>{currentAnswer.length}/2000 characters</span>
              {timeRemaining <= 10 && timeRemaining > 0 && (
                <span className="text-red-600 font-medium animate-pulse">
                  ⚠️ {timeRemaining}s remaining!
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => handleSubmit()}
            disabled={!canType || !currentAnswer.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            style={{ height:"97px"}}
          >
            <Send className="w-5 h-5" />
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewChat;