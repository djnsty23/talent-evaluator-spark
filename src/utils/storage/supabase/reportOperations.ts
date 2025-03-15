
import { Report } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Save reports to Supabase
 */
export const saveReports = async (reports: Report[]): Promise<void> => {
  for (const report of reports) {
    const { error } = await supabase
      .from('reports')
      .upsert({ 
        id: report.id,
        job_id: report.jobId,
        title: report.title,
        content: report.content
      });
    
    if (error) {
      console.error('Error saving report to Supabase:', error);
      throw error;
    }
    
    // Link candidates to report
    if (report.candidateIds && report.candidateIds.length > 0) {
      await linkCandidatesToReport(report.id, report.candidateIds);
    }
  }
};

/**
 * Save report data to Supabase
 */
export const saveReportData = async (data: Report): Promise<void> => {
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
  await linkCandidatesToReport(data.id, data.candidateIds);
};

/**
 * Link candidates to a report
 */
export const linkCandidatesToReport = async (reportId: string, candidateIds: string[]): Promise<void> => {
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
};
