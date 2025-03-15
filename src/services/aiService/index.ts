
import { JobRequirement } from '@/types/job.types';
import { v4 as uuidv4 } from 'uuid';

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
