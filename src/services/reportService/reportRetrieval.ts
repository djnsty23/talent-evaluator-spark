
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/types/job.types';
import { toast } from 'sonner';

// Get all reports for a specific job
export const getReportsForJob = async (jobId: string): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*, report_candidates(candidate_id)')
      .eq('job_id', jobId);
    
    if (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
      return [];
    }
    
    if (!data) return [];
    
    // Transform to our application model
    return data.map(report => ({
      id: report.id,
      title: report.title,
      summary: `Report for job ${jobId}`,
      content: report.content || '',
      jobId: report.job_id,
      createdAt: report.created_at,
      // Extract candidate IDs from the joined report_candidates table
      candidateIds: report.report_candidates?.map((rc: any) => rc.candidate_id) || []
    }));
    
  } catch (error) {
    console.error('Error getting reports:', error);
    toast.error('Failed to load reports');
    return [];
  }
};

// Get a specific report by ID
export const getReportById = async (reportId: string): Promise<Report | null> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*, report_candidates(candidate_id)')
      .eq('id', reportId)
      .single();
    
    if (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
      return null;
    }
    
    if (!data) return null;
    
    // Transform to our application model
    return {
      id: data.id,
      title: data.title,
      summary: `Report details`,
      content: data.content || '',
      jobId: data.job_id,
      createdAt: data.created_at,
      // Extract candidate IDs from the joined report_candidates table
      candidateIds: data.report_candidates?.map((rc: any) => rc.candidate_id) || []
    };
    
  } catch (error) {
    console.error('Error getting report:', error);
    toast.error('Failed to load report');
    return null;
  }
};

// No redundant export at the end of the file
