
export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  department: string;
  salary: string;
  requirements: string[];
  candidates: Candidate[];
  contextFiles: File[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl: string;
  matchScore?: number;
  strengths?: string[];
  weaknesses?: string[];
  status: 'pending' | 'reviewed' | 'interviewed' | 'hired' | 'rejected';
  notes?: string;
  jobId: string;
  userId: string;
  createdAt: string;
}

export interface JobReport {
  id: string;
  title: string;
  summary: string;
  content: string;
  jobId: string;
  userId: string;
  createdAt: string;
}
