
import { Candidate, JobRequirement } from '@/contexts/JobContext';

export interface Job {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  description: string;
  candidates: Candidate[];
  requirements: JobRequirement[];
  createdAt: string;
}

export interface Report {
  id: string;
  title: string;
  summary: string;
  content: string;
  candidateIds: string[];
  additionalPrompt?: string;
  jobId: string;
  createdAt: string;
}
