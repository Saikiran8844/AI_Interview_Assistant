import { Question, Answer } from '../types';

// Gemini REST API helper (avoids SDK to prevent ConsoleInspector issues)
const GEMINI_MODEL = 'gemini-2.5-flash'; // Correct model for REST API v1
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1';

async function callGemini(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('VITE_GEMINI_API_KEY not found, using fallback responses');
    // Return a mock response when API key is not available
    return getFallbackGeminiResponse(prompt);
  }

  const resp = await fetch(
    `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`Gemini API error ${resp.status}: ${errText || resp.statusText}`);
  }

  const data: any = await resp.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
      .join('') ?? '';

  if (!text) {
    throw new Error('Empty response from Gemini API');
  }

  return text;
}

function getFallbackGeminiResponse(prompt: string): string {
  if (prompt.includes('generate 6 technical interview questions')) {
    return `[
      { "id": "easy-1", "text": "What is the difference between let, const, and var in JavaScript?", "difficulty": "easy", "timeLimit": 20 },
      { "id": "easy-2", "text": "Explain what JSX is and how it differs from regular HTML.", "difficulty": "easy", "timeLimit": 20 },
      { "id": "medium-1", "text": "How would you handle state management in a large React application? Compare different approaches.", "difficulty": "medium", "timeLimit": 60 },
      { "id": "medium-2", "text": "Explain the event loop in Node.js and how it handles asynchronous operations.", "difficulty": "medium", "timeLimit": 60 },
      { "id": "hard-1", "text": "Design a scalable architecture for a real-time chat application with millions of users. Consider both frontend and backend aspects.", "difficulty": "hard", "timeLimit": 120 },
      { "id": "hard-2", "text": "Implement a custom React hook that manages a queue of API requests with retry logic and concurrent request limits.", "difficulty": "hard", "timeLimit": 120 }
    ]`;
  } else if (prompt.includes('Score this candidate')) {
    return `{
      "score": ${Math.floor(Math.random() * 4) + 6},
      "feedback": "Good understanding demonstrated. Consider providing more specific examples and technical details in your explanations."
    }`;
  } else if (prompt.includes('overall assessment')) {
    return `{
      "score": ${Math.floor(Math.random() * 30) + 60},
      "summary": "The candidate demonstrates solid technical knowledge with good problem-solving abilities. Shows understanding of core concepts with room for growth in advanced topics. Recommended for further consideration."
    }`;
  }
  return '{"error": "Fallback response not available for this prompt type"}';
}

export class AIService {
  static async generateQuestions(resumeText: string): Promise<Question[]> {
    try {
      const prompt = `You are an interviewer. Based on this resume content, generate 6 technical interview questions.
      Resume:
      ${resumeText}

      Rules:
      1. Create 2 easy, 2 medium, and 2 hard questions.
      2. Each question should be practical and test real-world skills.
      3. Return JSON array of objects like:
      [
        { "id": "easy-1", "text": "...", "difficulty": "easy", "timeLimit": 20 },
        { "id": "easy-2", "text": "...", "difficulty": "easy", "timeLimit": 20 },
        { "id": "medium-1", "text": "...", "difficulty": "medium", "timeLimit": 60 },
        { "id": "medium-2", "text": "...", "difficulty": "medium", "timeLimit": 60 },
        { "id": "hard-1", "text": "...", "difficulty": "hard", "timeLimit": 120 },
        { "id": "hard-2", "text": "...", "difficulty": "hard", "timeLimit": 120 }
      ]

      Focus on full-stack development (React/Node.js) questions. Make sure the JSON is valid and properly formatted.`;

      const text = await callGemini(prompt);

      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const questions = JSON.parse(jsonMatch[0]);

      // Validate the structure
      if (!Array.isArray(questions) || questions.length !== 6) {
        throw new Error('Invalid questions format from AI');
      }

      return questions.map((q: any, index: number) => ({
        id: q.id || `question-${index + 1}`,
        text: q.text || q.question || 'Question not provided',
        difficulty: q.difficulty || (index < 2 ? 'easy' : index < 4 ? 'medium' : 'hard'),
        timeLimit: q.timeLimit || (index < 2 ? 20 : index < 4 ? 60 : 120),
      }));
    } catch (error) {
      console.error('Error generating questions with Gemini:', error);

      // Fallback to default questions if AI fails
      return this.getFallbackQuestions();
    }
  }

  static async scoreAnswer(
    question: Question,
    answer: string,
    timeUsed: number
  ): Promise<{ score: number; feedback: string }> {
    try {
      const prompt = `You are an expert technical interviewer. Score this candidate's answer on a scale of 1-10.

      Question: ${question.text}
      Difficulty: ${question.difficulty}
      Time Limit: ${question.timeLimit} seconds
      Time Used: ${timeUsed} seconds
      
      Candidate's Answer: ${answer}

      Please provide:
      1. A score from 1-10 (10 being excellent)
      2. Constructive feedback (2-3 sentences)

      Consider:
      - Technical accuracy
      - Completeness of answer
      - Time efficiency
      - Practical understanding

      Return ONLY a valid JSON object in this exact format:
      {
        "score": 8,
        "feedback": "Your feedback here..."
      }`;

      const text = await callGemini(prompt);
      console.log('Raw Gemini response for scoring:', text);

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON object found in response:', text);
        throw new Error('No valid JSON found in AI response');
      }

      let evaluation;
      try {
        evaluation = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Raw JSON:', jsonMatch[0]);
        throw new Error('Invalid JSON format from AI');
      }

      return {
        score: Math.max(1, Math.min(10, evaluation.score || 5)),
        feedback: evaluation.feedback || 'Answer received and evaluated.',
      };
    } catch (error) {
      console.error('Error scoring answer with Gemini:', error);

      // Fallback scoring logic
      return this.getFallbackScore(question, answer, timeUsed);
    }
  }

  static async generateSummary(
    answers: Answer[]
  ): Promise<{ score: number; summary: string }> {
    try {
      const answersText = answers
        .map(
          (a, index) =>
            `Question ${index + 1} (${a.difficulty}): ${a.question}
        Answer: ${a.answer}
        Score: ${a.score}/10
        Time: ${a.timeUsed}s/${a.timeLimit}s`
        )
        .join('\n\n');

      const prompt = `You are an expert technical interviewer. Based on these interview answers, provide an overall assessment.

      Interview Results:
      ${answersText}

      Please provide:
      1. An overall score out of 100
      2. A comprehensive summary (3-4 sentences) covering:
         - Technical strengths and weaknesses
         - Communication skills
         - Overall recommendation

      Return ONLY a valid JSON object in this exact format:
      {
        "score": 75,
        "summary": "Your detailed summary here..."
      }`;

      const text = await callGemini(prompt);
      console.log('Raw Gemini response for summary:', text);

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON object found in response:', text);
        throw new Error('No valid JSON found in AI response');
      }

      let evaluation;
      try {
        evaluation = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Raw JSON:', jsonMatch[0]);
        throw new Error('Invalid JSON format from AI');
      }

      return {
        score: Math.max(0, Math.min(100, evaluation.score || 50)),
        summary: evaluation.summary || 'Interview completed successfully.',
      };
    } catch (error) {
      console.error('Error generating summary with Gemini:', error);

      // Fallback summary logic
      return this.getFallbackSummary(answers);
    }
  }

  // Fallback methods for when AI fails
  private static getFallbackQuestions(): Question[] {
    return [
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
      {
        id: 'medium-1',
        text:
          'How would you handle state management in a large React application? Compare different approaches.',
        difficulty: 'medium',
        timeLimit: 60,
      },
      {
        id: 'medium-2',
        text: 'Explain the event loop in Node.js and how it handles asynchronous operations.',
        difficulty: 'medium',
        timeLimit: 60,
      },
      {
        id: 'hard-1',
        text:
          'Design a scalable architecture for a real-time chat application with millions of users. Consider both frontend and backend aspects.',
        difficulty: 'hard',
        timeLimit: 120,
      },
      {
        id: 'hard-2',
        text:
          'Implement a custom React hook that manages a queue of API requests with retry logic and concurrent request limits.',
        difficulty: 'hard',
        timeLimit: 120,
      },
    ];
  }

  private static getFallbackScore(
    question: Question,
    answer: string,
    timeUsed: number
  ): { score: number; feedback: string } {
    const answerLength = answer.trim().length;
    const timeRatio = timeUsed / question.timeLimit;

    let baseScore = 0;
    if (answerLength > 100) baseScore = 7;
    else if (answerLength > 50) baseScore = 5;
    else if (answerLength > 20) baseScore = 3;
    else if (answerLength > 0) baseScore = 2;

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

  private static getFallbackSummary(
    answers: Answer[]
  ): { score: number; summary: string } {
    const avgScore =
      answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length;
    const totalScore = Math.round(avgScore * 10);

    let summary = '';
    if (totalScore >= 80) {
      summary =
        'Excellent candidate with strong technical skills and deep understanding of full-stack development. Shows great problem-solving abilities and communication skills. Highly recommended for senior positions.';
    } else if (totalScore >= 60) {
      summary =
        'Good candidate with solid foundation in full-stack technologies. Demonstrates competent problem-solving skills with room for growth. Suitable for mid-level positions with mentorship.';
    } else if (totalScore >= 40) {
      summary =
        'Candidate shows basic understanding of concepts but needs significant development. May be suitable for junior positions with proper training and guidance.';
    } else {
      summary =
        'Candidate requires substantial improvement in technical skills and understanding. Consider additional training or alternative roles better suited to current skill level.';
    }

    return { score: totalScore, summary };
  }
}