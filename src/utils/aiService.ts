import { Question, Answer } from '../types';

// Mock AI service - In production, replace with actual AI API calls
export class AIService {
  private static questions: Question[] = [
    // Easy questions
    {
      id: 'easy-1',
      text: 'What is the difference between let, const, and var in JavaScript?',
      difficulty: 'easy',
      timeLimit: 20,
    },
    {
      id: 'easy-2',
      text: 'Explain what JSX is and how it differs from regular HTML.',
      difficulty: 'easy',
      timeLimit: 20,
    },
    // Medium questions
    {
      id: 'medium-1',
      text: 'How would you handle state management in a large React application? Compare different approaches.',
      difficulty: 'medium',
      timeLimit: 60,
    },
    {
      id: 'medium-2',
      text: 'Explain the event loop in Node.js and how it handles asynchronous operations.',
      difficulty: 'medium',
      timeLimit: 60,
    },
    // Hard questions
    {
      id: 'hard-1',
      text: 'Design a scalable architecture for a real-time chat application with millions of users. Consider both frontend and backend aspects.',
      difficulty: 'hard',
      timeLimit: 120,
    },
    {
      id: 'hard-2',
      text: 'Implement a custom React hook that manages a queue of API requests with retry logic and concurrent request limits.',
      difficulty: 'hard',
      timeLimit: 120,
    },
  ];

  static async generateQuestions(): Promise<Question[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return shuffled questions maintaining difficulty order
    const easy = this.questions.filter(q => q.difficulty === 'easy').slice(0, 2);
    const medium = this.questions.filter(q => q.difficulty === 'medium').slice(0, 2);
    const hard = this.questions.filter(q => q.difficulty === 'hard').slice(0, 2);
    
    return [...easy, ...medium, ...hard];
  }

  static async scoreAnswer(question: Question, answer: string, timeUsed: number): Promise<{ score: number; feedback: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock scoring logic
    const answerLength = answer.trim().length;
    const timeRatio = timeUsed / question.timeLimit;
    
    let baseScore = 0;
    if (answerLength > 50) baseScore = 7;
    else if (answerLength > 20) baseScore = 5;
    else if (answerLength > 0) baseScore = 3;
    
    // Adjust based on time used
    const timeBonus = timeRatio < 0.5 ? 2 : timeRatio < 0.8 ? 1 : 0;
    const finalScore = Math.min(10, baseScore + timeBonus);
    
    const feedbacks = [
      'Good understanding of the concept. Consider providing more specific examples.',
      'Solid answer with room for improvement. Try to be more detailed in your explanations.',
      'Excellent response showing deep understanding of the topic.',
      'Basic understanding shown. Could benefit from more technical depth.',
      'Great answer! You demonstrate strong knowledge and practical experience.',
    ];
    
    return {
      score: finalScore,
      feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
    };
  }

  static async generateSummary(answers: Answer[]): Promise<{ score: number; summary: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const avgScore = answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length;
    const totalScore = Math.round(avgScore * 10);
    
    let summary = '';
    if (totalScore >= 80) {
      summary = 'Excellent candidate with strong technical skills and deep understanding of full-stack development. Shows great problem-solving abilities and communication skills. Highly recommended for senior positions.';
    } else if (totalScore >= 60) {
      summary = 'Good candidate with solid foundation in full-stack technologies. Demonstrates competent problem-solving skills with room for growth. Suitable for mid-level positions with mentorship.';
    } else if (totalScore >= 40) {
      summary = 'Candidate shows basic understanding of concepts but needs significant development. May be suitable for junior positions with proper training and guidance.';
    } else {
      summary = 'Candidate requires substantial improvement in technical skills and understanding. Consider additional training or alternative roles better suited to current skill level.';
    }
    
    return { score: totalScore, summary };
  }
}