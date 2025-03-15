
import { Job, Report } from '@/types/job.types';
import { toast } from 'sonner';
import { fetchJobsData, fetchReportsData } from './supabase/dataFetchers';

/**
 * Get jobs and reports data from Supabase
 */
export const getStorageData = async (): Promise<{ jobs: Job[]; reports: Report[] }> => {
  try {
    console.log('Fetching data from Supabase');
    
    // Fetch jobs and reports in parallel for better performance
    const [jobs, reports] = await Promise.all([
      fetchJobsData(),
      fetchReportsData()
    ]);
    
    console.log('All data loaded from Supabase:', { jobCount: jobs.length, reportCount: reports.length });
    
    return { jobs, reports };
  } catch (err) {
    console.error('Error loading data from Supabase:', err);
    toast.error('Failed to load data from the database');
    return { jobs: [], reports: [] };
  }
};
