
import { v4 as uuidv4 } from 'uuid';
import { Report } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Save reports to Supabase
 */
export const saveReports = async (reports: Report[]): Promise<void> => {
  for (const report of reports) {
    try {
      const { error } = await supabase
        .from('reports')
        .upsert({ 
          id: report.id,
          job_id: report.jobId,
          title: report.title || 'Candidate Report',
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
    } catch (err) {
      console.error('Failed to save report:', err);
      throw err;
    }
  }
};

/**
 * Save report data to Supabase
 */
export const saveReportData = async (data: Report): Promise<void> => {
  try {
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
  } catch (err) {
    console.error('Failed to save report data:', err);
    throw err;
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
