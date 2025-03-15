
import { Job, Report } from '@/types/job.types';

// Interface for storage data structure
export interface StorageData {
  jobs: Job[];
  reports: Report[];
}

// Interface for Supabase job data structure
export interface SupabaseJob {
  id: string;
  title: string;
  company: string | null;
  description: string | null;
  location: string | null;
  department: string | null;
  salary: any; // Could be string, number, or null
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Interface for Supabase report data structure
export interface SupabaseReport {
  id: string;
  title: string;
  content: string | null;
  job_id: string;
  created_at: string;
}

// Interface for Supabase job requirement structure
export interface SupabaseJobRequirement {
  id: string;
  job_id: string;
  title: string;
  description: string | null;
  weight: number | null;
  created_at: string;
  updated_at: string;
}

// Interface for Supabase candidate structure
export interface SupabaseCandidate {
  id: string;
  job_id: string;
  name: string;
  resume_text: string | null;
  file_name: string | null;
  content_type: string | null;
  is_starred: boolean | null;
  created_at: string;
  updated_at: string;
}

// Interface for Supabase candidate score structure
export interface SupabaseCandidateScore {
  id: string;
  candidate_id: string;
  requirement_id: string;
  score: number;
  explanation: string | null;
  created_at: string;
}
