
import { Report } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Save reports to Supabase
 */
export const saveReports = async (reports: Report[]): Promise<void> => {
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
      toast.error('Failed to save report');
      throw error;
    }
    
    // Also save the candidate links
    if (report.candidateIds && report.candidateIds.length > 0) {
      await saveCandidateReportLinks(report.id, report.candidateIds);
    }
  }
};

/**
 * Save the links between candidates and reports
 */
const saveCandidateReportLinks = async (reportId: string, candidateIds: string[]): Promise<void> => {
  for (const candidateId of candidateIds) {
    const { error } = await supabase
      .from('report_candidates')
      .upsert({ 
        report_id: reportId,
        candidate_id: candidateId
      });
    
    if (error) {
      console.error('Error saving candidate-report link to Supabase:', error);
      // Don't throw here, just log and continue
    }
  }
};
