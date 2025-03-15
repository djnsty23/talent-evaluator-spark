
import { Job, Report } from '@/types/job.types';
import { toast } from 'sonner';
import { saveJobs } from './saveJobs';
import { saveReports } from './saveReports';
import { getUserId } from '@/utils/authUtils';

/**
 * Save data to Supabase
 */
export const saveStorageData = async (data: { jobs?: Job[], reports?: Report[] }): Promise<void> => {
  try {
    // First verify authentication
    const userId = await getUserId();
    if (!userId) {
      console.error('User not authenticated when trying to save data');
      toast.error('You must be logged in to save data');
      return;
    }
    
    console.log('Saving data to Supabase:', data);
    
    // If jobs are provided, save them
    if (data.jobs && data.jobs.length > 0) {
      try {
        await saveJobs(data.jobs);
      } catch (error) {
        console.error('Error saving jobs:', error);
        toast.error('Failed to save job data');
      }
    }
    
    // If reports are provided, save them
    if (data.reports && data.reports.length > 0) {
      try {
        await saveReports(data.reports);
      } catch (error) {
        console.error('Error saving reports:', error);
        toast.error('Failed to save report data');
      }
    }
  } catch (err) {
    console.error('Error saving data to Supabase:', err);
    toast.error('Failed to save data to the database');
  }
};
