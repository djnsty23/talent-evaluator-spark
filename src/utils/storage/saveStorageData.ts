
import { Job, Report } from '@/types/job.types';
import { toast } from 'sonner';
import { saveJobs } from './saveJobs';
import { saveReports } from './saveReports';

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
