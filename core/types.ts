
export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  classId?: string; 
  dateOfBirth?: string; // YYYY-MM-DD
  parentPhoneNumber?: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  schoolYear: string;
  joinCode: string;
}

// FIX: Define Subject type to resolve import error in pages/admin/ManageSubjects.tsx.
export interface Subject {
  id: string;
  name: string;
  description: string;
}

export interface Topic {
  id: string;
  name: string;
  order: number;
  // FIX: Add optional subjectId to support topic management within subjects in pages/admin/ManageSubjects.tsx.
  subjectId?: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string; // Could be markdown or HTML
  documentUrl?: string; // URL for video, slides, or download link
  mediaType?: 'video' | 'presentation' | 'document' | 'none'; // New field to determine render type
  status: 'draft' | 'published';
  topicId: string;
}

export interface Assignment {
  id:string;
  title: string;
  description: string;
  lessonId: string;
  dueDate: string; // ISO 8601 date string
  maxPoints: number;
  type: 'text' | 'file';
  rubric: string; // Simple text-based rubric
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string; // ISO 8601 date string
  content: string; // Text content or file URL
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export interface Progress {
  id: string;
  studentId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string; // teacher's id
  createdAt: string;
  classId: string;
  targetAudience: 'student' | 'parent' | 'all';
}

// --- Question Bank Types ---
export type QuestionType = 'multiple-choice' | 'short-answer' | 'ordering' | 'fill-in-the-blank';

export interface QuestionOption {
  id: string; // Unique within the question, e.g., 'opt1', 'opt2'
  text: string;
}

export interface Question {
  id: string;
  text: string; // For fill-in-the-blank, use a placeholder like '[BLANK]'
  type: QuestionType;
  options?: QuestionOption[]; // Used for 'multiple-choice' and 'ordering'
  // 'multiple-choice': array of correct option IDs, e.g., ['opt2']
  // 'ordering': array of option IDs in correct sequence, e.g., ['opt3', 'opt1', 'opt2']
  // 'short-answer': array of acceptable string answers (case-insensitive)
  // 'fill-in-the-blank': array of strings for each blank in order
  answers: string[]; 
  difficulty: 'easy' | 'medium' | 'hard';
  topicId: string; // Link to a topic for organization
}
