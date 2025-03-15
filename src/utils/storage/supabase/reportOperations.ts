
import { v4 as uuidv4 } from 'uuid';
import { Report } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Save reports to Supabase
 */
export const saveReports = async (reports: Report[]): Promise<void> => {
  for (const report of reports) {
    try {
      // Ensure we have all required fields and valid IDs
      const reportId = report.id || uuidv4();
      
      if (!report.jobId) {
        console.error('Missing jobId for report:', report);
        toast.error('Missing job ID for report');
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
      
      // Link candidates to report if the initial insertion worked
      if (report.candidateIds && report.candidateIds.length > 0) {
        await linkCandidatesToReport(reportId, report.candidateIds);
      }
    } catch (err) {
      console.error('Failed to save report:', err);
    }
  }
};

/**
 * Save report data to Supabase
 */
export const saveReportData = async (data: Report): Promise<void> => {
  try {
    // Ensure report ID is valid
    const reportId = data.id || uuidv4();
    
    if (!data.jobId) {
      console.error('Missing jobId for report:', data);
      toast.error('Missing job ID for report');
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
    
    // Only link candidates if candidates are provided and initial insertion worked
    if (data.candidateIds && data.candidateIds.length > 0) {
      await linkCandidatesToReport(reportId, data.candidateIds);
    }
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
    for (const candidateId of candidateIds) {
      const { error: linkError } = await supabase
        .from('report_candidates')
        .upsert({
          report_id: reportId,
          candidate_id: candidateId
        });
      
      if (linkError) {
        console.error('Error linking candidate to report:', linkError);
      }
    }
  } catch (err) {
    console.error('Failed to link candidates to report:', err);
  }
};
