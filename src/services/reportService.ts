
import { v4 as uuidv4 } from 'uuid';
import { Job, Report } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';

export const generateReport = async (
  job: Job,
  candidateIds: string[], 
  additionalPrompt?: string
): Promise<Report> => {
  try {
    // Create a report with basic information
    const report: Report = {
      id: uuidv4(),
      title: `Candidate Ranking Report for ${job.title}`,
      summary: `Analysis of ${candidateIds.length} candidates for ${job.title} at ${job.company}`,
      content: `Report is being generated. This will be replaced with actual content from the analysis service.`,
      candidateIds,
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
      throw new Error('Failed to save report');
    }
    
    // Link candidates to report
    for (const candidateId of candidateIds) {
      const { error: linkError } = await supabase.from('report_candidates').insert({
        report_id: report.id,
        candidate_id: candidateId
      });
      
      if (linkError) {
        console.error('Error linking candidate to report:', linkError);
      }
    }
    
    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    throw new Error('Failed to generate report');
  }
};
