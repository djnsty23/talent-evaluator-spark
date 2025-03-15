import { JobRequirement, Job, Candidate, Report } from '@/types/job.types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateMockAnalysis } from './candidateService/mockDataGenerator';

/**
 * Job Service for CRUD operations on jobs
 */
export class JobService {
  /**
   * Create a new job in Supabase
   */
  static async createJob(job: Job): Promise<Job> {
    try {
      console.log('Creating job in Supabase:', job);
      
      const { error } = await supabase
        .from('jobs')
        .insert({
          id: job.id,
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location || '',
          department: job.department || '',
        });
      
      if (error) {
        console.error('Error creating job in Supabase:', error);
        toast.error('Failed to create job');
        throw error;
      }
      
      toast.success('Job created successfully');
      return job;
    } catch (error) {
      console.error('Exception creating job:', error);
      throw error;
    }
  }

  /**
   * Update an existing job in Supabase
   */
  static async updateJob(job: Job): Promise<Job> {
    try {
      console.log('Updating job in Supabase:', job);
      
      const { error } = await supabase
        .from('jobs')
        .update({
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location || '',
          department: job.department || '',
        })
        .eq('id', job.id);
      
      if (error) {
        console.error('Error updating job in Supabase:', error);
        toast.error('Failed to update job');
        throw error;
      }
      
      return job;
    } catch (error) {
      console.error('Exception updating job:', error);
      throw error;
    }
  }

  /**
   * Delete a job from Supabase
   */
  static async deleteJob(jobId: string): Promise<void> {
    try {
      console.log('Deleting job from Supabase:', jobId);
      
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);
      
      if (error) {
        console.error('Error deleting job from Supabase:', error);
        toast.error('Failed to delete job');
        throw error;
      }
      
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Exception deleting job:', error);
      throw error;
    }
  }

  /**
   * Upload candidate files for a job
   */
  static async uploadCandidateFiles(jobId: string, files: File[]): Promise<Candidate[]> {
    try {
      console.log(`Uploading ${files.length} candidates for job ${jobId}`);
      
      // Create an array to store the new candidates
      const newCandidates: Candidate[] = [];
      
      // Process each file and create a candidate
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Extract the file name without extension as candidate name
        let candidateName = file.name.replace(/\.[^/.]+$/, "");
        if (!candidateName) candidateName = `Candidate ${i + 1}`;
        
        // Create a new candidate
        const candidate: Candidate = {
          id: uuidv4(),
          name: candidateName,
          resumeUrl: URL.createObjectURL(file),
          jobId,
          scores: [],
          overallScore: 0,
          strengths: [],
          weaknesses: [],
          status: 'pending',
          processedAt: new Date().toISOString()
        };
        
        newCandidates.push(candidate);
        
        // Save the candidate to Supabase
        const { error } = await supabase
          .from('candidates')
          .insert({
            id: candidate.id,
            name: candidate.name,
            job_id: jobId,
            status: 'pending'
          });
          
        if (error) {
          console.error('Error saving candidate to Supabase:', error);
          // Continue with other candidates
        }
      }
      
      return newCandidates;
    } catch (error) {
      console.error('Error uploading candidate files:', error);
      throw error;
    }
  }

  /**
   * Star a candidate
   */
  static async starCandidate(jobId: string, candidateId: string, isStarred: boolean): Promise<void> {
    try {
      console.log(`Starring candidate ${candidateId} for job ${jobId}: ${isStarred}`);
      
      const { error } = await supabase
        .from('candidates')
        .update({ is_starred: isStarred })
        .eq('id', candidateId)
        .eq('job_id', jobId);
      
      if (error) {
        console.error('Error starring candidate in Supabase:', error);
        toast.error('Failed to update candidate');
        throw error;
      }
    } catch (error) {
      console.error('Exception starring candidate:', error);
      throw error;
    }
  }

  /**
   * Delete a candidate
   */
  static async deleteCandidate(jobId: string, candidateId: string): Promise<void> {
    try {
      console.log(`Deleting candidate ${candidateId} from job ${jobId}`);
      
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', candidateId)
        .eq('job_id', jobId);
      
      if (error) {
        console.error('Error deleting candidate from Supabase:', error);
        toast.error('Failed to delete candidate');
        throw error;
      }
      
      toast.success('Candidate deleted successfully');
    } catch (error) {
      console.error('Exception deleting candidate:', error);
      throw error;
    }
  }
}

/**
 * Report Service for generating and managing reports
 */
export class ReportService {
  /**
   * Generate a report for candidates
   */
  static async generateReport(
    job: Job,
    candidates: Candidate[],
    additionalPrompt?: string
  ): Promise<Report> {
    try {
      console.log(`Generating report for ${candidates.length} candidates in job ${job.title}`);
      
      // Create a new report ID
      const reportId = uuidv4();
      
      // Get candidate IDs
      const candidateIds = candidates.map(c => c.id);
      
      // Generate report content based on candidates and job data
      let content = `# Candidate Ranking Report for ${job.title}\n\n`;
      content += `## Job Overview\n\n`;
      content += `Position: ${job.title}\n`;
      content += `Company: ${job.company}\n`;
      content += `Description: ${job.description}\n\n`;
      
      content += `## Candidates Summary\n\n`;
      content += `Total Candidates Analyzed: ${candidates.length}\n\n`;
      
      // Sort candidates by overall score
      const sortedCandidates = [...candidates].sort((a, b) => b.overallScore - a.overallScore);
      
      // Add top candidates
      content += `## Top Candidates\n\n`;
      for (let i = 0; i < Math.min(3, sortedCandidates.length); i++) {
        const candidate = sortedCandidates[i];
        content += `### ${i + 1}. ${candidate.name}\n`;
        content += `Overall Score: ${candidate.overallScore}/10\n\n`;
        content += `Strengths:\n`;
        for (const strength of candidate.strengths) {
          content += `- ${strength}\n`;
        }
        content += `\nWeaknesses:\n`;
        for (const weakness of candidate.weaknesses) {
          content += `- ${weakness}\n`;
        }
        content += `\n`;
      }
      
      // Add detailed comparison
      content += `## Detailed Comparison\n\n`;
      content += `| Candidate | Overall Score | Key Strengths | Areas for Improvement |\n`;
      content += `| --- | --- | --- | --- |\n`;
      
      for (const candidate of sortedCandidates) {
        const strengths = candidate.strengths.slice(0, 2).join(", ");
        const weaknesses = candidate.weaknesses.slice(0, 2).join(", ");
        content += `| ${candidate.name} | ${candidate.overallScore}/10 | ${strengths} | ${weaknesses} |\n`;
      }
      
      // If there's an additional prompt, add a section for it
      if (additionalPrompt) {
        content += `\n## Additional Analysis\n\n`;
        content += `Based on the request: "${additionalPrompt}"\n\n`;
        content += `The candidates have been evaluated based on the specific request. `;
        content += `The rankings above reflect this additional consideration.\n\n`;
      }
      
      // Create a report object
      const report: Report = {
        id: reportId,
        title: `Candidate Ranking Report for ${job.title}`,
        summary: `Analysis of ${candidates.length} candidates for ${job.title} at ${job.company}`,
        content: content,
        candidateIds: candidateIds,
        jobId: job.id,
        createdAt: new Date().toISOString(),
        additionalPrompt: additionalPrompt
      };
      
      // Save the report to Supabase
      await supabase.from('reports').insert({
        id: report.id,
        title: report.title,
        content: report.content,
        job_id: job.id
      });
      
      // Save the report-candidate relationships
      for (const candidateId of candidateIds) {
        await supabase.from('report_candidates').insert({
          report_id: report.id,
          candidate_id: candidateId
        });
      }
      
      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }
}

/**
 * AI Service for various AI-powered features
 */
export class AIService {
  /**
   * Generate job requirements based on job info and context files
   */
  static async generateRequirements(data: {
    jobInfo: {
      title: string;
      company: string;
      description: string;
    };
    contextFiles: string[];
  }): Promise<{ requirements: JobRequirement[] }> {
    try {
      console.log('AI Generate Requirements Request:', data);
      
      // If no OpenAI key is set, use mock data
      if (!window.openAIKey) {
        throw new Error('OpenAI API key not set');
      }
      
      // Mock OpenAI response for development
      const mockRequirements = [
        {
          id: uuidv4(),
          description: "Direct experience in customer success or a related role",
          weight: 5,
          category: "Experience",
          isRequired: true
        },
        {
          id: uuidv4(),
          description: "Experience working in SaaS and/or familiarity with A/B testing, experimentation, or CRO",
          weight: 4,
          category: "Technical",
          isRequired: true
        },
        {
          id: uuidv4(),
          description: "Ability to analyze customer pain points, interpret data, and provide solutions",
          weight: 5,
          category: "Skills",
          isRequired: true
        }
      ];
      
      return { requirements: mockRequirements };
    } catch (error) {
      console.error('Error generating requirements:', error);
      throw error;
    }
  }

  /**
   * Extract text from a file
   */
  static async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to extract text from file'));
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Analyze a candidate against job requirements
   */
  static async analyzeCandidate(
    candidateData: { content: string },
    requirements: JobRequirement[]
  ): Promise<any> {
    try {
      console.log('AI Analyze Candidate Request:', { candidateData, requirements });

      // If no OpenAI key is set, use mock data
      if (!window.openAIKey) {
        throw new Error('OpenAI API key not set');
      }

      // Map job requirements to numbered format for OpenAI context (1, 2, 3...)
      const numberedRequirements = requirements.map((req, index) => ({
        ...req,
        displayNumber: index + 1
      }));

      // Format the requirements for the prompt
      const requirementsText = numberedRequirements
        .map(req => `${req.displayNumber}. ${req.description} (Weight: ${req.weight}, Required: ${req.isRequired ? 'Yes' : 'No'})`)
        .join('\n');

      // Mock OpenAI response for development
      // Create scores with proper UUIDs from the requirements
      const mockScores = numberedRequirements.map(req => ({
        requirementId: req.id, // Use actual UUID from requirements
        score: Math.floor(Math.random() * 4) + 6, // 6-9
        notes: `The candidate has ${Math.random() > 0.7 ? 'excellent' : 'good'} experience in ${req.description}.`
      }));

      const mockResponse = {
        scores: mockScores,
        overallScore: 8,
        strengths: [
          'Strong communication skills',
          'Experience in customer success',
          'Technical aptitude'
        ],
        weaknesses: [
          'Limited experience with specific tools',
          'Could benefit from more formal training'
        ],
        notes: 'Overall, a strong candidate for the customer success role.',
        personalityTraits: ['Analytical', 'Collaborative', 'Detail-oriented'],
        cultureFit: 8,
        leadershipPotential: 7,
        education: "Bachelor's Degree",
        yearsOfExperience: 4,
        location: 'Remote',
        skillKeywords: ['Customer Success', 'SaaS', 'Relationship Management'],
        communicationStyle: 'Clear and concise',
        preferredTools: ['Zendesk', 'Salesforce', 'Google Analytics']
      };

      // Use mock response since this is a frontend-only demo
      return mockResponse;
    } catch (error) {
      console.error('Error in AI analysis:', error);
      throw error;
    }
  }

  /**
   * Generate a report
   */
  static async generateReport(
    job: any,
    candidates: any[],
    additionalPrompt?: string
  ): Promise<any> {
    try {
      console.log('AI Generate Report Request:', {
        job,
        candidatesCount: candidates.length,
        additionalPrompt
      });
      
      // Mock response with the report content and structured data
      return {
        content: `# Candidate Ranking Report for ${job.title}\n\nThis report analyzes ${candidates.length} candidates for the ${job.title} position at ${job.company}.\n\n${additionalPrompt ? `Additional context: ${additionalPrompt}\n\n` : ''}## Top Candidates\n\n1. ${candidates[0]?.name || 'Candidate 1'}\n2. ${candidates[1]?.name || 'Candidate 2'}\n3. ${candidates[2]?.name || 'Candidate 3'}\n\n## Detailed Analysis\n\nThe candidates have been evaluated based on the job requirements...`,
        candidateRankings: candidates.map((c, i) => ({
          candidateId: c.id,
          name: c.name,
          rank: i + 1,
          overallScore: 10 - i
        })),
        topCandidates: candidates.slice(0, 3).map(c => c.id),
        comparisonMatrix: candidates.map(c => ({
          candidateId: c.id,
          strengths: c.strengths || ['Communication', 'Technical skills'],
          weaknesses: c.weaknesses || ['Limited experience'],
          score: c.overallScore || Math.floor(Math.random() * 3) + 7
        }))
      };
    } catch (error) {
      console.error('Error generating AI report:', error);
      throw error;
    }
  }
}

export const extractTextFromFile = AIService.extractTextFromFile;
