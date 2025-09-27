import { Candidate } from '../types';

const STORAGE_KEY = 'interview_assistant_data';

export interface AppData {
  candidates: Candidate[];
  currentCandidateId: string | null;
}

export const loadData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Convert date strings back to Date objects
      parsed.candidates = parsed.candidates.map((candidate: any) => ({
        ...candidate,
        startedAt: new Date(candidate.startedAt),
        completedAt: candidate.completedAt ? new Date(candidate.completedAt) : undefined,
      }));
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
  }
  
  return {
    candidates: [],
    currentCandidateId: null,
  };
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
};

export const clearData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};