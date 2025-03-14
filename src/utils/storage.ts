
import { Job, Report } from '@/types/job.types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
    
    // Transform jobs data to match our application model
    const jobs: Job[] = Array.isArray(jobsData) ? jobsData.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company || '',
      description: job.description || '',
      location: job.location || '',
      department: job.department || '',
      salary: job.salary ? String(job.salary) : undefined, // Convert to string or undefined
      requirements: [], // Will need to fetch these separately in a real implementation
      candidates: [], // Will need to fetch these separately in a real implementation
      userId: job.user_id,
      createdAt: job.created_at,
      updatedAt: job.updated_at
    })) : [];
    
    // Transform reports data to match our application model
    const reports: Report[] = Array.isArray(reportsData) ? reportsData.map(report => ({
      id: report.id,
      title: report.title,
      summary: 'Report summary', // Not stored in DB currently
      content: report.content || '',
      candidateIds: [], // Will need to fetch these separately in a real implementation
      jobId: report.job_id,
      createdAt: report.created_at
    })) : [];
    
    console.log('Data loaded from Supabase:', { jobs, reports });
    
    return { jobs, reports };
  } catch (err) {
    console.error('Error loading data from Supabase:', err);
    toast.error('Failed to load data from the database');
    return { jobs: [], reports: [] };
  }
};

/**
 * Save data to Supabase
 */
export const saveStorageData = async (data: { jobs?: Job[], reports?: Report[] }): Promise<void> => {
  try {
    console.log('Saving data to Supabase:', data);
    
    // If jobs are provided, save them
    if (data.jobs && data.jobs.length > 0) {
      for (const job of data.jobs) {
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
    }
    
    // If reports are provided, save them
    if (data.reports && data.reports.length > 0) {
      for (const report of data.reports) {
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
    }
  } catch (err) {
    console.error('Error saving data to Supabase:', err);
    toast.error('Failed to save data to the database');
  }
};

/**
 * Save a single entity to Supabase
 */
export const mockSaveData = async (data: any): Promise<void> => {
  try {
    console.log('Saving data to Supabase:', data);
    
    // If we're saving a job
    if (data.id && (data.title || data.candidates)) {
      const { error } = await supabase
        .from('jobs')
        .upsert({ 
          id: data.id,
          title: data.title,
          company: data.company,
          description: data.description,
          location: data.location,
          department: data.department,
          user_id: data.userId || 'user_1' // Ensure we have a user_id
        });
      
      if (error) {
        console.error('Error saving job to Supabase:', error);
        throw error;
      }
      
      // Save candidates if they exist
      if (data.candidates && data.candidates.length > 0) {
        for (const candidate of data.candidates) {
          const { error: candidateError } = await supabase
            .from('candidates')
            .upsert({ 
              id: candidate.id,
              name: candidate.name,
              is_starred: candidate.isStarred,
              job_id: data.id
              // Add other fields as needed
            });
          
          if (candidateError) {
            console.error('Error saving candidate to Supabase:', candidateError);
          }
        }
      }
    }
    
    // If we're saving a report
    if (data.id && data.candidateIds) {
      const { error } = await supabase
        .from('reports')
        .upsert({ 
          id: data.id,
          title: data.title || 'Candidate Report',
          content: data.content,
          job_id: data.jobId
        });
      
      if (error) {
        console.error('Error saving report to Supabase:', error);
        throw error;
      }
      
      // Link candidates to report
      for (const candidateId of data.candidateIds) {
        const { error: linkError } = await supabase
          .from('report_candidates')
          .upsert({
            report_id: data.id,
            candidate_id: candidateId
          });
        
        if (linkError) {
          console.error('Error linking candidate to report:', linkError);
        }
      }
    }
    
    // If we're deleting a job
    if (data.id && data.deleted) {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', data.id);
      
      if (error) {
        console.error('Error deleting job from Supabase:', error);
        throw error;
      }
    }
  } catch (err) {
    console.error('Error saving to Supabase:', err);
    throw err;
  }
};
