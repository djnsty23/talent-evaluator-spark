
import { Job, Report } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { transformJobData, transformReportData } from './transformers';

/**
 * Get jobs data from Supabase
 */
export const getStorageData = async (): Promise<{ jobs: Job[]; reports: Report[] }> => {
  try {
    // Fetch jobs
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select('*');
    
    if (jobsError) {
      console.error('Error loading jobs from Supabase:', jobsError);
      throw jobsError;
    }
    
    // Fetch reports
    const { data: reportsData, error: reportsError } = await supabase
      .from('reports')
      .select('*');
    
    if (reportsError) {
      console.error('Error loading reports from Supabase:', reportsError);
      throw reportsError;
    }
    
    // Transform data to match our application model
    const jobs = transformJobData(jobsData || []);
    const reports = transformReportData(reportsData || []);
    
    console.log('Data loaded from Supabase:', { jobs, reports });
    
    return { jobs, reports };
  } catch (err) {
    console.error('Error loading data from Supabase:', err);
    toast.error('Failed to load data from the database');
    return { jobs: [], reports: [] };
  }
};
