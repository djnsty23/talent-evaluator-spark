
import { Job, Report } from '@/types/job.types';

export interface SupabaseJob {
  id: string;
  title: string;
  company?: string;
  description?: string;
  location?: string;
  department?: string;
  salary?: string | any;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseReport {
  id: string;
  title: string;
  content?: string;
  job_id: string;
  created_at: string;
}
