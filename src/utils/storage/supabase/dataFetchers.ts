
import { Job, Report } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { transformJobData, transformReportData } from '../transformers';

/**
 * Fetch jobs data from Supabase
 */
export const fetchJobsData = async (): Promise<Job[]> => {
  try {
    console.log('Fetching jobs from Supabase');
    
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select('*');
    
    if (jobsError) {
      console.error('Error loading jobs from Supabase:', jobsError);
      throw jobsError;
    }
    
    // Transform data to match our application model
    const jobs = transformJobData(jobsData || []);
    
    console.log('Jobs loaded from Supabase:', { jobCount: jobs.length });
    
    return jobs;
  } catch (err) {
    console.error('Error loading jobs from Supabase:', err);
    toast.error('Failed to load jobs from the database');
    return [];
  }
};

/**
 * Fetch reports data from Supabase
 */
export const fetchReportsData = async (): Promise<Report[]> => {
  try {
    console.log('Fetching reports from Supabase');
    
    const { data: reportsData, error: reportsError } = await supabase
      .from('reports')
      .select('*');
    
    if (reportsError) {
      console.error('Error loading reports from Supabase:', reportsError);
      throw reportsError;
    }
    
    // Transform data to match our application model
    const reports = transformReportData(reportsData || []);
    
    console.log('Reports loaded from Supabase:', { reportCount: reports.length });
    
    return reports;
  } catch (err) {
    console.error('Error loading reports from Supabase:', err);
    toast.error('Failed to load reports from the database');
    return [];
  }
};
