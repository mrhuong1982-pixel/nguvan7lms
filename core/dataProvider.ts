
import type { Submission } from './types';

export interface DataProvider {
  seedData: () => void;
  getList: <T>(resource: string) => Promise<T[]>;
  getOne: <T>(resource: string, id: string) => Promise<T | undefined>;
  create: <T>(resource: string, data: Omit<T, 'id'>) => Promise<T>;
  update: <T extends { id: string }>(resource: string, data: T) => Promise<T>;
  deleteOne: (resource: string, id: string) => Promise<void>;
  
  // Specific actions
  submitAssignment: (submission: Omit<Submission, 'id' | 'submittedAt'>) => Promise<Submission>;
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => Promise<Submission>;
  getReport: (studentId: string) => Promise<any>; // Placeholder for a detailed report structure
}
