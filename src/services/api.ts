
// This is a mock implementation of the API service
// In a real application, this would make actual API calls to a backend server

import { toast } from 'sonner';

// Mock delay for API calls
const mockApiDelay = async (ms: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

interface AIAnalysisRequest {
  content: string;
  jobInfo?: {
    title: string;
    company: string;
    description: string;
  };
  additionalContext?: string;
}

interface AIRequirementsResponse {
  requirements: {
    id: string;
    category: string;
    description: string;
    weight: number;
    isRequired: boolean;
  }[];
}

interface AICandidateAnalysisResponse {
  scores: {
    requirementId: string;
    score: number;
    notes?: string;
  }[];
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  notes: string;
}

interface AIReportGenerationResponse {
  content: string;
}

export class AIService {
  // Analyze job description to generate requirements
  static async generateRequirements(jobInfo: AIAnalysisRequest): Promise<AIRequirementsResponse> {
    try {
      // Log the request for debugging in dev environment
      console.log('AI Generate Requirements Request:', jobInfo);
      
      // In a real app, this would call an OpenAI-powered API endpoint
      await mockApiDelay(2000);
      
      // Generate mock requirements based on job title
      const categories = ['Technical Skills', 'Soft Skills', 'Education', 'Experience', 'Language'];
      const mockRequirements = [];
      
      // Technical skills
      mockRequirements.push({
        id: `req_${Date.now()}_1`,
        category: 'Technical Skills',
        description: `Proficiency in programming languages relevant to ${jobInfo.jobInfo?.title || 'this role'}`,
        weight: 9,
        isRequired: true,
      });
      
      mockRequirements.push({
        id: `req_${Date.now()}_2`,
        category: 'Technical Skills',
        description: 'Experience with industry tools and frameworks',
        weight: 8,
        isRequired: true,
      });
      
      // Soft skills
      mockRequirements.push({
        id: `req_${Date.now()}_3`,
        category: 'Soft Skills',
        description: 'Strong communication and teamwork abilities',
        weight: 7,
        isRequired: true,
      });
      
      mockRequirements.push({
        id: `req_${Date.now()}_4`,
        category: 'Soft Skills',
        description: 'Problem-solving and analytical thinking',
        weight: 8,
        isRequired: true,
      });
      
      // Education
      mockRequirements.push({
        id: `req_${Date.now()}_5`,
        category: 'Education',
        description: `Bachelor's degree in a field relevant to ${jobInfo.jobInfo?.title || 'this role'}`,
        weight: 6,
        isRequired: false,
      });
      
      // Experience
      mockRequirements.push({
        id: `req_${Date.now()}_6`,
        category: 'Experience',
        description: '3+ years of relevant experience in the industry',
        weight: 8,
        isRequired: true,
      });
      
      // Added implied requirement
      mockRequirements.push({
        id: `req_${Date.now()}_7`,
        category: 'Language',
        description: 'Fluency in English (written and verbal communication)',
        weight: 9,
        isRequired: true,
      });
      
      return { requirements: mockRequirements };
    } catch (error) {
      console.error('Error generating requirements:', error);
      throw new Error('Failed to generate job requirements');
    }
  }

  // Analyze candidate resume against job requirements
  static async analyzeCandidate(
    candidateData: AIAnalysisRequest,
    requirements: Array<{
      id: string;
      category: string;
      description: string;
      weight: number;
      isRequired: boolean;
    }>
  ): Promise<AICandidateAnalysisResponse> {
    try {
      // Log the request for debugging in dev environment
      console.log('AI Analyze Candidate Request:', { candidateData, requirements });
      
      // In a real app, this would call an OpenAI-powered API endpoint
      await mockApiDelay(3000);
      
      // Generate mock scores for the candidate based on requirements
      const scores = requirements.map(req => ({
        requirementId: req.id,
        score: Math.floor(Math.random() * 10) + 1, // Random score 1-10
        notes: `AI analysis for ${req.description}`,
      }));
      
      // Calculate overall score based on weighted average
      const totalWeight = requirements.reduce((sum, req) => sum + req.weight, 0);
      const weightedScore = requirements.reduce((sum, req, index) => {
        const score = scores[index]?.score || 0;
        return sum + (score * req.weight);
      }, 0);
      
      const overallScore = totalWeight > 0 
        ? Math.round((weightedScore / totalWeight) * 10) / 10 
        : 0;
      
      // Generate strengths and weaknesses
      const strengths = requirements
        .filter((req, index) => (scores[index]?.score || 0) >= 8)
        .map(req => req.description);
      
      const weaknesses = requirements
        .filter((req, index) => (scores[index]?.score || 0) <= 4)
        .map(req => req.description);
      
      return {
        scores,
        overallScore,
        strengths,
        weaknesses: weaknesses.length > 0 ? weaknesses : [],
        notes: 'This candidate has been evaluated based on the provided resume.',
      };
    } catch (error) {
      console.error('Error analyzing candidate:', error);
      throw new Error('Failed to analyze candidate resume');
    }
  }

  // Generate a ranking report for selected candidates
  static async generateReport(
    jobInfo: {
      title: string;
      company: string;
      description: string;
      requirements: Array<{
        id: string;
        category: string;
        description: string;
        weight: number;
        isRequired: boolean;
      }>;
    },
    candidates: Array<{
      id: string;
      name: string;
      overallScore: number;
      strengths: string[];
      weaknesses: string[];
    }>,
    additionalPrompt?: string
  ): Promise<AIReportGenerationResponse> {
    try {
      // Log the request for debugging in dev environment
      console.log('AI Generate Report Request:', { jobInfo, candidates, additionalPrompt });
      
      // In a real app, this would call an OpenAI-powered API endpoint
      await mockApiDelay(3000);
      
      // Sort candidates by overall score
      const sortedCandidates = [...candidates].sort(
        (a, b) => b.overallScore - a.overallScore
      );
      
      // Generate a mock report
      const reportContent = `
# Candidate Ranking Report for ${jobInfo.title} at ${jobInfo.company}

## Executive Summary
This report provides a comprehensive analysis and ranking of ${candidates.length} candidates for the ${jobInfo.title} position at ${jobInfo.company}.

## Ranking
${sortedCandidates.map((candidate, index) => `
### ${index + 1}. ${candidate.name} (Score: ${candidate.overallScore}/10)

**Strengths:**
${candidate.strengths.map(strength => `- ${strength}`).join('\n')}

**Areas for Development:**
${candidate.weaknesses.map(weakness => `- ${weakness}`).join('\n')}

**Overall Assessment:**
Candidate demonstrates ${candidate.overallScore >= 7 ? 'strong' : candidate.overallScore >= 5 ? 'moderate' : 'limited'} alignment with the position requirements.
`).join('\n')}

## Methodology
Candidates were evaluated against the job requirements using AI-powered resume analysis.

## Recommendations
${sortedCandidates[0] ? `We recommend moving forward with ${sortedCandidates[0].name} as the primary candidate.` : ''}
${sortedCandidates[1] ? `${sortedCandidates[1].name} would be a strong secondary choice.` : ''}

${additionalPrompt ? `## Additional Analysis (Based on Custom Prompt)
${additionalPrompt}

Response: The candidates have been evaluated with this specific focus in mind, and the rankings reflect this additional criteria.` : ''}

Report generated: ${new Date().toLocaleString()}
      `;
      
      return { content: reportContent };
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate candidate ranking report');
    }
  }
}

export const uploadFiles = async (files: File[]): Promise<string[]> => {
  try {
    // In a real app, this would upload files to a storage service
    await mockApiDelay(1500);
    
    // Return URLs to the uploaded files (in this mock, we'll use object URLs)
    return files.map(file => URL.createObjectURL(file));
  } catch (error) {
    console.error('Error uploading files:', error);
    toast.error('Failed to upload files');
    throw error;
  }
};

export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    // In a real app, this would extract text from files using appropriate libraries
    // For this mock, we'll just return a placeholder
    await mockApiDelay(1000);
    
    return `Mock extracted text from ${file.name}. This would contain the actual content of the resume or document in a real implementation.`;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from ${file.name}`);
  }
};
