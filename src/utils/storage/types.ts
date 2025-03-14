
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
