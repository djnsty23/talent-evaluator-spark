
import { v4 as uuidv4 } from 'uuid';
import { Job, Report } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateReportContent } from './generateReportContent';
import { getReportById, getReportsForJob } from './reportRetrieval';

export const generateReport = async (
  job: Job,
  candidateIds: string[], 
  additionalPrompt?: string
): Promise<Report> => {
  try {
    // Validate inputs
    if (!job) {
      throw new Error('Job data is missing');
    }
    
    if (!candidateIds || candidateIds.length === 0) {
      throw new Error('No candidates selected for report generation');
    }
    
    // Ensure all selected candidates exist in the job
    const validCandidateIds = candidateIds.filter(id => 
      job.candidates.some(c => c.id === id)
    );
    
    if (validCandidateIds.length === 0) {
      throw new Error('None of the selected candidates exist in this job');
    }
    
    // Log for debugging
    console.log(`Generating report for job: ${job.title}, with ${validCandidateIds.length} candidates`);
    
    // Generate the report content
    const reportContent = generateReportContent(job, validCandidateIds, additionalPrompt);
    
    // Create a report object
    const report: Report = {
      id: uuidv4(),
      title: `Candidate Ranking Report for ${job.title}`,
      summary: `Analysis of ${validCandidateIds.length} candidates for ${job.title} at ${job.company}`,
      content: reportContent,
      candidateIds: validCandidateIds,
      additionalPrompt,
      jobId: job.id,
      createdAt: new Date().toISOString(),
    };
    
    // Save to Supabase
    const { error } = await supabase.from('reports').insert({
      id: report.id,
      title: report.title,
      content: report.content,
      job_id: report.jobId // Map from our app's jobId to the DB's job_id
    });
    
    if (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report to database');
      throw new Error(`Failed to save report: ${error.message}`);
    }
    
    // Link candidates to report
    await linkCandidatesToReport(report.id, validCandidateIds);
    
    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to generate report');
    throw error;
  }
};

// Link candidates to a report
export const linkCandidatesToReport = async (reportId: string, candidateIds: string[]): Promise<void> => {
  try {
    if (!reportId || !candidateIds.length) {
      console.warn('Cannot link candidates: missing report ID or candidate IDs');
      return;
    }
    
    for (const candidateId of candidateIds) {
      const { error } = await supabase.from('report_candidates').insert({
        report_id: reportId,
        candidate_id: candidateId
      });
      
      if (error) {
        console.error('Error linking candidate to report:', error);
        toast.error('Error linking candidate to report');
      }
    }
  } catch (error) {
    console.error('Error linking candidates to report:', error);
  }
};

// Export the helper function for reuse elsewhere
export { generateReportContent, getReportById, getReportsForJob };
