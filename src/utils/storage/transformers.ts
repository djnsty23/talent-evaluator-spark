
import { Job, Report, JobRequirement, Candidate } from '@/types/job.types';
import { SupabaseJob, SupabaseReport } from './types';

/**
 * Transforms Supabase job data to our application model
 */
export function transformJobData(jobData: SupabaseJob[]): Job[] {
  return Array.isArray(jobData) ? jobData.map(job => ({
    id: job.id,
    title: job.title,
    company: job.company || '',
    description: job.description || '',
    location: job.location || '',
    department: job.department || '',
    salary: job.salary ? String(job.salary) : undefined,
    requirements: [], // Will load these separately with another query
    candidates: [], // Will load these separately with another query
    contextFiles: [], // Will load these separately with another query
    userId: job.user_id,
    createdAt: job.created_at,
    updatedAt: job.updated_at
  })) : [];
}

/**
 * Transforms Supabase report data to our application model
 */
export function transformReportData(reportData: SupabaseReport[]): Report[] {
  return Array.isArray(reportData) ? reportData.map(report => ({
    id: report.id,
    title: report.title,
    summary: 'Report summary', // Generate this from the content
    content: report.content || '',
    candidateIds: [], // Will load these separately with another query
    jobId: report.job_id,
    createdAt: report.created_at
  })) : [];
}

/**
 * Transforms Supabase job requirements to our application model
 */
export function transformRequirementsData(requirementsData: any[]): JobRequirement[] {
  return Array.isArray(requirementsData) ? requirementsData.map(req => ({
    id: req.id,
    description: req.description || '',
    weight: req.weight || 1,
    isRequired: req.weight > 5, // Consider high weight requirements as required
    category: req.title || 'General'
  })) : [];
}

/**
 * Transforms Supabase candidate data to our application model
 */
export function transformCandidateData(candidateData: any[]): Candidate[] {
  return Array.isArray(candidateData) ? candidateData.map(candidate => ({
    id: candidate.id,
    name: candidate.name,
    email: `${candidate.name.toLowerCase().replace(/\s/g, '.')}@example.com`, // Generate email from name
    resumeUrl: candidate.resume_url || '',
    overallScore: 0, // Will calculate this from scores
    scores: [],
    strengths: [],
    weaknesses: [],
    isStarred: candidate.is_starred || false,
    status: 'pending',
    jobId: candidate.job_id,
    processedAt: candidate.updated_at,
    personalityTraits: [],
    zodiacSign: '',
    workStyle: '',
    cultureFit: 0,
    leadershipPotential: 0,
    education: '',
    yearsOfExperience: 0,
    location: '',
    skillKeywords: [],
    availabilityDate: undefined,
    communicationStyle: '',
    preferredTools: []
  })) : [];
}
