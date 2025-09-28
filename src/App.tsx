import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, FileText, Trophy, Sun, Moon } from 'lucide-react';
import { Candidate, InterviewSession, Question, Answer } from './types';
import { loadData, saveData, AppData } from './utils/storage';
import { extractResumeInfo } from './utils/resumeParser';
import { AIService } from './utils/aiService';
import ResumeUpload from './components/ResumeUpload';
import InfoCollection from './components/InfoCollection';
import InterviewChat from './components/InterviewChat';
import CandidateDashboard from './components/CandidateDashboard';
import CandidateDetails from './components/CandidateDetails';
import WelcomeBackModal from './components/WelcomeBackModal';

type Tab = 'interviewee' | 'interviewer';
type IntervieweeStep = 'upload' | 'info_collection' | 'interview' | 'completed';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('interviewee');
  const [appData, setAppData] = useState<AppData>({ candidates: [], currentCandidateId: null });
  const [intervieweeStep, setIntervieweeStep] = useState<IntervieweeStep>('upload');
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Load data on mount
  useEffect(() => {
    const data = loadData();
    setAppData(data);

    // Check if there's an incomplete interview
    if (data.currentCandidateId) {
      const candidate = data.candidates.find(c => c.id === data.currentCandidateId);
      if (candidate && candidate.status !== 'completed') {
        setShowWelcomeBack(true);
      }
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    saveData(appData);
  }, [appData]);

  // Apply theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  const updateCandidate = (candidateId: string, updates: Partial<Candidate>) => {
    setAppData(prev => ({
      ...prev,
      candidates: prev.candidates.map(c => 
        c.id === candidateId ? { ...c, ...updates } : c
      ),
    }));
  };

  const handleResumeUpload = async (file: File, extractedInfo: any) => {
    const candidateId = Date.now().toString();
    const missingFields = [];
    
    if (!extractedInfo.name) missingFields.push('name');
    if (!extractedInfo.email) missingFields.push('email');
    if (!extractedInfo.phone) missingFields.push('phone');

    const newCandidate: Candidate = {
      id: candidateId,
      name: extractedInfo.name || '',
      email: extractedInfo.email || '',
      phone: extractedInfo.phone || '',
      resumeFile: file,
      resumeText: extractedInfo.text,
      status: 'incomplete',
      currentQuestionIndex: 0,
      startedAt: new Date(),
      score: 0,
      summary: '',
      answers: [],
      isPaused: false,
    };

    setAppData(prev => ({
      ...prev,
      candidates: [...prev.candidates, newCandidate],
      currentCandidateId: candidateId,
    }));

    setCurrentSession({
      candidateId,
      currentStep: missingFields.length > 0 ? 'info_collection' : 'interview',
      missingFields,
      questions: [],
    });

    if (missingFields.length > 0) {
      setIntervieweeStep('info_collection');
    } else {
      await startInterview(candidateId, extractedInfo.text);
    }
  };

  const handleInfoSubmit = async (info: { name: string; email: string; phone: string }) => {
    if (!currentSession) return;

    updateCandidate(currentSession.candidateId, {
      name: info.name,
      email: info.email,
      phone: info.phone,
    });

    const candidate = appData.candidates.find(c => c.id === currentSession.candidateId);
    await startInterview(currentSession.candidateId, candidate?.resumeText || '');
  };

  const startInterview = async (candidateId: string, resumeText: string) => {
    setIsGeneratingQuestions(true);
    try {
      const questions = await AIService.generateQuestions(resumeText);
      
      setCurrentSession(prev => prev ? {
        ...prev,
        currentStep: 'interview',
        questions,
      } : null);

      updateCandidate(candidateId, {
        status: 'in_progress',
      });

      setIntervieweeStep('interview');
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleAnswerSubmit = async (answer: string, timeUsed: number) => {
    if (!currentSession) return;

    const candidate = appData.candidates.find(c => c.id === currentSession.candidateId);
    if (!candidate) return;

    const currentQuestion = currentSession.questions[candidate.currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      const { score, feedback } = await AIService.scoreAnswer(currentQuestion, answer, timeUsed);

      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        question: currentQuestion.text,
        answer,
        difficulty: currentQuestion.difficulty,
        timeLimit: currentQuestion.timeLimit,
        timeUsed,
        score,
        feedback,
      };

      const updatedAnswers = [...candidate.answers, newAnswer];
      const nextQuestionIndex = candidate.currentQuestionIndex + 1;

      updateCandidate(candidate.id, {
        answers: updatedAnswers,
        currentQuestionIndex: nextQuestionIndex,
      });

      // Move to next question or complete interview
      if (nextQuestionIndex >= currentSession.questions.length) {
        // Interview completed - generate summary
        const { score: finalScore, summary } = await AIService.generateSummary(updatedAnswers);
        
        updateCandidate(candidate.id, {
          status: 'completed',
          completedAt: new Date(),
          score: finalScore,
          summary,
        });

        setAppData(prev => ({
          ...prev,
          currentCandidateId: null,
        }));

        setIntervieweeStep('completed');
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('Failed to process answer:', error);
    }
  };

  const handleInterviewComplete = () => {
    setIntervieweeStep('completed');
  };

  const handleWelcomeBackContinue = () => {
    setShowWelcomeBack(false);
    const candidate = appData.candidates.find(c => c.id === appData.currentCandidateId);
    if (candidate) {
      if (candidate.currentQuestionIndex === 0 && candidate.answers.length === 0) {
        setIntervieweeStep('upload');
      } else if (candidate.status === 'in_progress') {
        // Resume interview
        startInterview(candidate.id, candidate.resumeText || '');
      } else {
        setIntervieweeStep('upload');
      }
    }
  };

  const handleWelcomeBackRestart = () => {
    setShowWelcomeBack(false);
    if (appData.currentCandidateId) {
      // Remove the incomplete candidate
      setAppData(prev => ({
        ...prev,
        candidates: prev.candidates.filter(c => c.id !== prev.currentCandidateId),
        currentCandidateId: null,
      }));
    }
    setIntervieweeStep('upload');
    setCurrentSession(null);
  };

  const getCurrentCandidate = () => {
    if (!currentSession) return null;
    return appData.candidates.find(c => c.id === currentSession.candidateId) || null;
  };

  const resetInterview = () => {
    setIntervieweeStep('upload');
    setCurrentSession(null);
    setAppData(prev => ({
      ...prev,
      currentCandidateId: null,
    }));
  };

  const renderIntervieweeTab = () => {
    const candidate = getCurrentCandidate();

    switch (intervieweeStep) {
      case 'upload':
        return <ResumeUpload onUploadSuccess={handleResumeUpload} />;
      
      case 'info_collection':
        if (!currentSession || !candidate) return null;
        return (
          <InfoCollection
            missingFields={currentSession.missingFields}
            currentInfo={{
              name: candidate.name,
              email: candidate.email,
              phone: candidate.phone,
            }}
            onInfoSubmit={handleInfoSubmit}
            isGeneratingQuestions={isGeneratingQuestions}
          />
        );
      
      case 'interview':
        if (!currentSession || !candidate) return null;
        return (
          <InterviewChat
            questions={currentSession.questions}
            currentQuestionIndex={candidate.currentQuestionIndex}
            onAnswerSubmit={handleAnswerSubmit}
            onInterviewComplete={handleInterviewComplete}
            candidateName={candidate.name}
          />
        );
      
      case 'completed':
        return (
          <div className="text-center max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border dark:border-gray-700">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Interview Completed!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Thank you for completing the technical interview. Your responses have been recorded and will be reviewed by our team.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  You should hear back from us within 2-3 business days. We'll reach out via email with next steps.
                </p>
              </div>
              <button
                onClick={resetInterview}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="w-5 h-5" />
                Start New Interview
              </button>
            </div>
          </div>
        );
    }
  };

  const renderInterviewerTab = () => {
    if (selectedCandidate) {
      return (
        <CandidateDetails
          candidate={selectedCandidate}
          onBack={() => setSelectedCandidate(null)}
        />
      );
    }

    return (
      <CandidateDashboard
        candidates={appData.candidates}
        onCandidateSelect={setSelectedCandidate}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Welcome Back Modal */}
      {showWelcomeBack && appData.currentCandidateId && (
        <WelcomeBackModal
          candidate={appData.candidates.find(c => c.id === appData.currentCandidateId)!}
          onContinue={handleWelcomeBackContinue}
          onRestart={handleWelcomeBackRestart}
        />
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Interview Assistant
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('interviewee')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'interviewee'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                Interviewee
              </button>
              
              <button
                onClick={() => setActiveTab('interviewer')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'interviewer'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Users className="w-5 h-5" />
                Interviewer
                {appData.candidates.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                    {appData.candidates.length}
                  </span>
                )}
              </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'interviewee' ? renderIntervieweeTab() : renderInterviewerTab()}
      </main>
    </div>
  );
}

export default App;