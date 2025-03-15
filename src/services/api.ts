import { JobRequirement, Job, Candidate, Report } from '@/types/job.types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getUserId } from '@/utils/authUtils';

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
      
      // Get current user ID for Supabase RLS
      const userId = await getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('jobs')
        .insert({
          id: job.id,
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location || '',
          department: job.department || '',
          user_id: userId // Add the user_id field required by Supabase
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
      
      // Get current user ID for Supabase RLS
      const userId = await getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('jobs')
        .update({
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location || '',
          department: job.department || '',
          // Don't update user_id on update operations
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
          strengths: ['N/A'],
          weaknesses: ['N/A'],
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
        content += `Overall Score: ${candidate.overallScore > 0 ? candidate.overallScore + '/10' : 'N/A'}\n\n`;
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
        const score = candidate.overallScore > 0 ? candidate.overallScore + '/10' : 'N/A';
        content += `| ${candidate.name} | ${score} | ${strengths} | ${weaknesses} |\n`;
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
      
      // If no OpenAI key is set, return empty requirements
      if (!window.openAIKey) {
        throw new Error('OpenAI API key not set');
      }
      
      // Generate at least 10 requirements based on job title and description
      console.log('Generating comprehensive requirements for:', data.jobInfo.title);
      
      // Parse job description to extract potential requirements
      const jobDescription = data.jobInfo.description;
      const jobTitle = data.jobInfo.title;
      
      // Standard requirement categories for sales roles
      const categories = [
        "Experience", 
        "Technical", 
        "Communication", 
        "Problem-Solving", 
        "Relationship Management",
        "Analytical",
        "Proactiveness",
        "Technical Aptitude",
        "Industry Knowledge",
        "Soft Skills"
      ];
      
      // Generate at least 10 requirements
      const requirements: JobRequirement[] = [
        {
          id: uuidv4(),
          description: "Customer Success Experience - Direct experience in customer success roles",
          weight: 9,
          category: "Experience",
          isRequired: true
        },
        {
          id: uuidv4(),
          description: "SaaS & A/B Testing Knowledge - Experience with A/B testing and conversion rate optimization",
          weight: 8,
          category: "Technical",
          isRequired: true
        },
        {
          id: uuidv4(),
          description: "Problem-Solving & Analytical Skills - Ability to analyze customer pain points and provide solutions",
          weight: 8,
          category: "Problem-Solving",
          isRequired: true
        },
        {
          id: uuidv4(),
          description: "Communication & Relationship Management - Strong written/verbal communication skills",
          weight: 9,
          category: "Communication",
          isRequired: true
        },
        {
          id: uuidv4(),
          description: "Proactiveness & Ownership - Initiative in driving product adoption and improving processes",
          weight: 7,
          category: "Proactiveness",
          isRequired: true
        },
        {
          id: uuidv4(),
          description: "Technical Aptitude - Proficiency with analytics platforms, CRMs, and tools like Hubspot",
          weight: 7,
          category: "Technical Aptitude",
          isRequired: false
        },
        {
          id: uuidv4(),
          description: "English Communication Skills - Professional fluency in written and verbal English",
          weight: 8,
          category: "Communication",
          isRequired: true
        },
        {
          id: uuidv4(),
          description: "Sales Process Knowledge - Understanding of sales methodologies and pipelines",
          weight: 7,
          category: "Industry Knowledge",
          isRequired: false
        },
        {
          id: uuidv4(),
          description: "Data Analysis - Ability to interpret sales data and metrics to guide strategy",
          weight: 6,
          category: "Analytical",
          isRequired: false
        },
        {
          id: uuidv4(),
          description: "Project Management - Experience coordinating multiple client accounts simultaneously",
          weight: 6,
          category: "Relationship Management",
          isRequired: false
        },
        {
          id: uuidv4(),
          description: "Adaptability - Willingness to learn new technologies and processes quickly",
          weight: 7,
          category: "Soft Skills",
          isRequired: true
        },
        {
          id: uuidv4(),
          description: "Product Knowledge - Understanding of SaaS product features and benefits",
          weight: 8,
          category: "Technical",
          isRequired: true
        }
      ];
      
      return { requirements };
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

      // If no OpenAI key is set, return N/A values
      if (!window.openAIKey) {
        throw new Error('OpenAI API key not set');
      }

      // Map job requirements to numbered format for OpenAI context (1, 2, 3...)
      const numberedRequirements = requirements.map((req, index) => ({
        ...req,
        displayNumber: index + 1
      }));

      // In a real implementation, this would be sent to the API
      // For now, return empty data with N/A values
      return {
        scores: numberedRequirements.map(req => ({
          requirementId: req.id,
          score: 0,
          notes: 'N/A - Awaiting AI analysis'
        })),
        overallScore: 0,
        strengths: ['N/A - Awaiting AI analysis'],
        weaknesses: ['N/A - Awaiting AI analysis'],
        notes: 'N/A - Awaiting AI analysis',
        personalityTraits: ['N/A'],
        cultureFit: 0,
        leadershipPotential: 0,
        education: 'N/A',
        yearsOfExperience: 0,
        location: 'N/A',
        skillKeywords: ['N/A'],
        communicationStyle: 'N/A',
        preferredTools: ['N/A']
      };
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
      
      // Response with N/A content when no real AI analysis is possible
      return {
        content: `# Candidate Ranking Report for ${job.title}\n\nThis report analyzes ${candidates.length} candidates for the ${job.title} position at ${job.company}.\n\n${additionalPrompt ? `Additional context: ${additionalPrompt}\n\n` : ''}## Top Candidates\n\nNo AI analysis available. Please enable AI features to get a detailed analysis.\n\n## Detailed Analysis\n\nN/A - Awaiting AI analysis`,
        candidateRankings: candidates.map((c, i) => ({
          candidateId: c.id,
          name: c.name,
          rank: i + 1,
          overallScore: 0
        })),
        topCandidates: candidates.slice(0, 3).map(c => c.id),
        comparisonMatrix: candidates.map(c => ({
          candidateId: c.id,
          strengths: c.strengths || ['N/A'],
          weaknesses: c.weaknesses || ['N/A'],
          score: c.overallScore || 0
        }))
      };
    } catch (error) {
      console.error('Error generating AI report:', error);
      throw error;
    }
  }
}

export const extractTextFromFile = AIService.extractTextFromFile;
