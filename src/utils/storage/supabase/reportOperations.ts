
import { v4 as uuidv4 } from 'uuid';
import { Report } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserId } from '@/utils/authUtils';

/**
 * Save reports to Supabase
 */
export const saveReports = async (reports: Report[]): Promise<void> => {
  try {
    // Verify user is authenticated
    const currentUserId = await getUserId();
    if (!currentUserId) {
      console.error('User not authenticated, cannot save reports');
      toast.error('You must be logged in to save reports');
      return;
    }

    for (const report of reports) {
      try {
        // Ensure report has a valid UUID
        const reportId = report.id && report.id.includes('-') && report.id.length >= 36 
          ? report.id 
          : uuidv4();
        
        if (!report.jobId) {
          console.error('Missing jobId for report:', report);
          toast.error('Missing job ID for report');
          continue;
        }
        
        // First, verify job exists and belongs to current user
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('id, user_id')
          .eq('id', report.jobId)
          .eq('user_id', currentUserId)
          .maybeSingle();
        
        if (jobError || !jobData) {
          console.error('Failed to verify job ownership for report:', jobError);
          toast.error('Could not verify job ownership for report');
          continue;
        }
        
        const { error } = await supabase
          .from('reports')
          .upsert({ 
            id: reportId,
            job_id: report.jobId,
            title: report.title || 'Candidate Report',
            content: report.content
          });
        
        if (error) {
          console.error('Error saving report to Supabase:', error);
          toast.error('Failed to save report to database');
          continue;
        }
        
        // Link candidates to report if candidates are provided
        if (report.candidateIds && report.candidateIds.length > 0) {
          await linkCandidatesToReport(reportId, report.candidateIds);
        }
        
        toast.success('Report saved successfully');
      } catch (err) {
        console.error('Failed to save report:', err);
        toast.error('Failed to save report due to an unexpected error');
      }
    }
  } catch (err) {
    console.error('Error in saveReports:', err);
    toast.error('Failed to save reports');
  }
};

/**
 * Save a single report to Supabase
 */
export const saveReportData = async (data: Report): Promise<void> => {
  try {
    // Verify user is authenticated
    const currentUserId = await getUserId();
    if (!currentUserId) {
      console.error('User not authenticated, cannot save report');
      toast.error('You must be logged in to save the report');
      return;
    }

    // Ensure report ID is valid
    const reportId = data.id && data.id.includes('-') && data.id.length >= 36 ? data.id : uuidv4();
    
    if (!data.jobId) {
      console.error('Missing jobId for report:', data);
      toast.error('Missing job ID for report');
      return;
    }
    
    // First, verify job exists and belongs to current user
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('id, user_id')
      .eq('id', data.jobId)
      .eq('user_id', currentUserId)
      .maybeSingle();
    
    if (jobError || !jobData) {
      console.error('Failed to verify job ownership for report:', jobError);
      toast.error('Could not verify job ownership for report');
      return;
    }
    
    const { error } = await supabase
      .from('reports')
      .upsert({ 
        id: reportId,
        title: data.title || 'Candidate Report',
        content: data.content,
        job_id: data.jobId
      });
    
    if (error) {
      console.error('Error saving report to Supabase:', error);
      toast.error('Failed to save report to database');
      return;
    }
    
    // Link candidates if candidates are provided
    if (data.candidateIds && data.candidateIds.length > 0) {
      await linkCandidatesToReport(reportId, data.candidateIds);
    }
    
    toast.success('Report saved successfully');
  } catch (err) {
    console.error('Failed to save report data:', err);
    toast.error('Failed to save report data');
  }
};

/**
 * Link candidates to a report
 */
export const linkCandidatesToReport = async (reportId: string, candidateIds: string[]): Promise<void> => {
  try {
    const currentUserId = await getUserId();
    if (!currentUserId) {
      console.error('User not authenticated, cannot link candidates to report');
      return;
    }
    
    // First get the job_id for this report to verify ownership
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .select('job_id')
      .eq('id', reportId)
      .single();
      
    if (reportError || !reportData) {
      console.error('Report not found:', reportError);
      return;
    }
    
    // Verify user owns the job
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', reportData.job_id)
      .eq('user_id', currentUserId)
      .maybeSingle();
      
    if (jobError || !jobData) {
      console.error('Cannot verify job ownership:', jobError);
      return;
    }
    
    // For each candidate, verify it belongs to the same job before linking
    for (const candidateId of candidateIds) {
      try {
        // Verify the candidate belongs to the job
        const { data: candidateData, error: candidateError } = await supabase
          .from('candidates')
          .select('id')
          .eq('id', candidateId)
          .eq('job_id', reportData.job_id)
          .maybeSingle();
          
        if (candidateError || !candidateData) {
          console.warn(`Candidate ${candidateId} does not belong to job ${reportData.job_id}, skipping`);
          continue;
        }
        
        const { error: linkError } = await supabase
          .from('report_candidates')
          .upsert({
            report_id: reportId,
            candidate_id: candidateId
          });
        
        if (linkError) {
          console.error('Error linking candidate to report:', linkError);
        }
      } catch (err) {
        console.error('Error linking candidate:', err);
      }
    }
  } catch (err) {
    console.error('Failed to link candidates to report:', err);
  }
};
