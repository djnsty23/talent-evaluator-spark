
import { v4 as uuidv4 } from 'uuid';
import { Job, Report } from '@/types/job.types';
import { mockSaveData } from '@/utils/storage';
import { generateMockReportContent } from '@/utils/candidateUtils';

export const generateReport = async (
  job: Job,
  candidateIds: string[], 
  additionalPrompt?: string
): Promise<Report> => {
  // Create a mock report
  const report: Report = {
    id: uuidv4(),
    title: `Candidate Ranking Report for ${job.title}`,
    summary: `Analysis of ${candidateIds.length} candidates for ${job.title} at ${job.company}`,
    content: generateMockReportContent(job, candidateIds, additionalPrompt),
    candidateIds,
    additionalPrompt,
    jobId: job.id,
    createdAt: new Date().toISOString(),
  };
  
  // Mock API call
  await mockSaveData(report);
  
  return report;
};
