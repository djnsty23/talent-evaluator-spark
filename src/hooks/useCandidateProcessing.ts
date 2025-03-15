
import { Job } from '@/types/job.types';
import { useCandidateProcessing as useProcessingHook } from './candidate-processing';

export function useCandidateProcessing(jobId: string | undefined, job: Job | null) {
  // Use the new modular implementation
  return useProcessingHook(jobId, job);
}
