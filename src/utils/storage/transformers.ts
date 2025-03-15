
import { Job, Report } from '@/types/job.types';
import { SupabaseJob, SupabaseReport } from './types';

/**
 * Transforms Supabase job data to our application model
 */
export function transformJobData(jobData: SupabaseJob[]): Job[] {
  return Array.isArray(jobData) ? jobData.map(job => ({
    id: job.id,
    title: job.title,
    company: job.company || '',
    description: job.description || '',
    location: job.location || '',
    department: job.department || '',
    salary: job.salary ? 
      (typeof job.salary === 'string' ? JSON.parse(job.salary) : job.salary) : 
      undefined,
    requirements: [], // Will need to fetch these separately in a real implementation
    candidates: [], // Will need to fetch these separately in a real implementation
    contextFiles: [], // Will need to fetch these separately
    createdAt: job.created_at,
    updatedAt: job.updated_at,
    user: {
      id: job.user_id,
      name: '',
      email: ''
    }
  })) : [];
}

/**
 * Transforms Supabase report data to our application model
 */
export function transformReportData(reportData: SupabaseReport[]): Report[] {
  return Array.isArray(reportData) ? reportData.map(report => ({
    id: report.id,
    title: report.title,
    summary: 'Report summary', // Not stored in DB currently
    content: report.content || '',
    candidateIds: [], // Will need to fetch these separately in a real implementation
    jobId: report.job_id,
    createdAt: report.created_at
  })) : [];
}
