
import { Job, Report } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Save data to Supabase
 */
export const saveStorageData = async (data: { jobs?: Job[], reports?: Report[] }): Promise<void> => {
  try {
    console.log('Saving data to Supabase:', data);
    
    // If jobs are provided, save them
    if (data.jobs && data.jobs.length > 0) {
      await saveJobs(data.jobs);
    }
    
    // If reports are provided, save them
    if (data.reports && data.reports.length > 0) {
      await saveReports(data.reports);
    }
  } catch (err) {
    console.error('Error saving data to Supabase:', err);
    toast.error('Failed to save data to the database');
  }
};

/**
 * Save jobs to Supabase
 */
const saveJobs = async (jobs: Job[]): Promise<void> => {
  for (const job of jobs) {
    const { error } = await supabase
      .from('jobs')
      .upsert({ 
        id: job.id,
        title: job.title,
        company: job.company,
        description: job.description,
        location: job.location,
        department: job.department,
        salary: job.salary, // Supabase can handle string to jsonb conversion
        user_id: job.userId // Map from our app's userId to the DB's user_id
      });
    
    if (error) {
      console.error('Error saving job to Supabase:', error);
      throw error;
    }
  }
};

/**
 * Save reports to Supabase
 */
const saveReports = async (reports: Report[]): Promise<void> => {
  for (const report of reports) {
    const { error } = await supabase
      .from('reports')
      .upsert({ 
        id: report.id,
        title: report.title,
        content: report.content,
        job_id: report.jobId // Map from our app's jobId to the DB's job_id
      });
    
    if (error) {
      console.error('Error saving report to Supabase:', error);
      throw error;
    }
  }
};
