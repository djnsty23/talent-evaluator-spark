
import { v4 as uuidv4 } from 'uuid';
import { Job, Report, Candidate } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateReportContent } from './generateReportContent';
import { linkCandidatesToReport } from './reportLinking';
import { AIService } from '@/services/api';
import { formatCandidatesForAI, formatJobForAI } from './formatters';

/**
 * Generate a new report for the given job and candidates
 */
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
    
    // Create a deep copy of the job to avoid modifying the original
    const jobCopy = JSON.parse(JSON.stringify(job));
    
    // Ensure all selected candidates exist in the job
    const validCandidateIds = candidateIds.filter(id => 
      jobCopy.candidates.some(c => c.id === id)
    );
    
    if (validCandidateIds.length === 0) {
      throw new Error('None of the selected candidates exist in this job');
    }
    
    // Log for debugging
    console.log(`Generating report for job: ${jobCopy.title}, with ${validCandidateIds.length} candidates`);
    
    // Get selected candidates with their details
    const selectedCandidates = validCandidateIds.map(id => {
      return jobCopy.candidates.find(c => c.id === id) || null;
    }).filter(Boolean) as Candidate[];
    
    if (selectedCandidates.length === 0) {
      throw new Error('Failed to retrieve candidate data');
    }
    
    // Generate report content
    let reportContent: string;
    let reportData: any = null;
    
    try {
      // Try to use the AI service first
      console.log('Attempting to generate report using AI service');
      
      if (window.openAIKey) {
        // Format job and candidates for the AI
        const formattedJob = formatJobForAI(jobCopy);
        const formattedCandidates = formatCandidatesForAI(selectedCandidates);
        
        if (!formattedJob) {
          throw new Error('Failed to format job data for AI');
        }
        
        console.log('Formatted data for AI:', { formattedJob, formattedCandidates });
        
        // Call the AI service
        const aiResult = await AIService.generateReport(
          formattedJob,
          formattedCandidates,
          additionalPrompt
        );
        
        reportContent = aiResult.content;
        reportData = {
          candidateRankings: aiResult.candidateRankings,
          topCandidates: aiResult.topCandidates,
          comparisonMatrix: aiResult.comparisonMatrix
        };
        
        console.log('AI service generated report successfully');
      } else {
        // Fall back to local generation if no API key
        console.log('No OpenAI key available, using local report generation');
        reportContent = generateReportContent(jobCopy, validCandidateIds, additionalPrompt);
      }
    } catch (error) {
      console.error('Error using AI service for report generation:', error);
      // Fall back to local generation on error
      reportContent = generateReportContent(jobCopy, validCandidateIds, additionalPrompt);
    }
    
    // Create a report object
    const report: Report = {
      id: uuidv4(),
      title: `Candidate Ranking Report for ${jobCopy.title}`,
      summary: `Analysis of ${validCandidateIds.length} candidates for ${jobCopy.title} at ${jobCopy.company}`,
      content: reportContent,
      candidateIds: validCandidateIds,
      additionalPrompt,
      jobId: jobCopy.id,
      createdAt: new Date().toISOString(),
      metadata: reportData
    };
    
    console.log('Report object created:', report);
    
    // Try to save to Supabase
    try {
      console.log('Saving report to Supabase:', report.id);
      
      const { error } = await supabase.from('reports').insert({
        id: report.id,
        title: report.title,
        content: report.content,
        job_id: report.jobId // Map from our app's jobId to the DB's job_id
      });
      
      if (error) {
        console.error('Error saving report to Supabase:', error);
        toast.error('Could not save report to database');
        // Continue execution - we'll at least return the report object even if DB save fails
      } else {
        console.log('Report saved successfully to Supabase');
        
        // Only try to link candidates if report was saved successfully
        await linkCandidatesToReport(report.id, validCandidateIds);
        
        toast.success('Report generated and saved successfully');
      }
    } catch (error) {
      console.error('Exception saving report to Supabase:', error);
      toast.error('Failed to save report to database');
      // Continue execution
    }
    
    return report;
  } catch (error) {
    console.error('Error generating report:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to generate report');
    throw error;
  }
};
