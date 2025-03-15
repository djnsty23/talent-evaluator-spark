
import { Job, Candidate, JobRequirement, Report } from '@/types/job.types';

// Re-export types that the context depends on
export type { Job, Candidate, JobRequirement, Report };

export interface JobContextType {
  jobs: Job[];
  reports: Report[];
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;
  createJob: (jobData: Partial<Job>) => Promise<Job>;
  updateJob: (jobData: Job) => Promise<Job>;
  deleteJob: (jobId: string) => Promise<void>;
  uploadCandidateFiles: (jobId: string, files: File[]) => Promise<void>;
  processCandidate: (jobId: string, candidateId: string) => Promise<void>;
  handleProcessAllCandidates: (jobId: string) => Promise<void>;
  starCandidate: (jobId: string, candidateId: string, isStarred: boolean) => Promise<void>;
  deleteCandidate: (jobId: string, candidateId: string) => Promise<void>;
  generateReport: (jobId: string, candidateIds: string[], additionalPrompt?: string) => Promise<Report>;
  setCurrentJob: (job: Job | null) => void;
}
