export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface FormField {
  label: string;
  type: 'text' | 'number' | 'email' | 'textarea' | 'select';
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
}

export interface Form {
  id: string;
  title: string;
  fields: FormField[];
  accessEmails: string[];
  createdBy: string;
  createdAt: string;
  submissions?: FormSubmission[];
}

export interface FormSubmission {
  submissionId: string;
  submittedAt: string;
  submittedBy: string;
  answers: Record<string, any>;
  logs: FormLog[];
}

export interface FormLog {
  field: string;
  value: any;
  userId: string;
  updatedAt: string;
}

export interface FormAnswers {
  [fieldLabel: string]: any;
}

export interface FieldLock {
  field: string;
  userId: string;
  lockedAt: number;
}

export interface CollaborativeState {
  answers: FormAnswers;
  locks: FieldLock[];
  activeUsers: string[];
}