import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { JobRequirement } from '@/types/job.types';
import { getUserId } from '@/utils/authUtils';

interface AIAnalysisRequest {
  content?: string;
  jobInfo?: {
    title: string;
    company: string;
    description: string;
  };
  additionalContext?: string;
  contextFiles?: string[];
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
  cultureFit: number;
  cultureFitNotes: string;
  leadershipPotential: number;
  leadershipNotes: string;
  technicalSkills: string[];
  softSkills: string[];
  experienceEvaluation: string;
}

interface AIReportGenerationResponse {
  content: string;
}

export class AIService {
  // Analyze job description to generate requirements using OpenAI
  static async generateRequirements(jobInfo: AIAnalysisRequest): Promise<AIRequirementsResponse> {
    try {
      console.log('AI Generate Requirements Request:', jobInfo);
      
      if (!window.openAIKey) {
        toast.error('Please set your OpenAI API key first');
        throw new Error('OpenAI API key not set');
      }
      
      // Get current user ID for RLS compliance
      const currentUserId = await getUserId();
      if (!currentUserId) {
        toast.error('You must be logged in to generate requirements');
        throw new Error('User not authenticated');
      }
      
      const description = jobInfo.jobInfo?.description || '';
      const title = jobInfo.jobInfo?.title || '';
      const company = jobInfo.jobInfo?.company || '';
      const contextFiles = jobInfo.contextFiles || [];
      
      // Build context from additional files if provided
      let additionalContext = '';
      if (contextFiles.length > 0) {
        additionalContext = `\n\nAdditional context from company documents:\n${contextFiles.join('\n\n')}`;
      }
      
      // Call the real OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.openAIKey || ''}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an AI specialized in HR and recruitment. Your task is to analyze job descriptions and extract structured job requirements.`
            },
            {
              role: 'user',
              content: `Generate structured job requirements for the following position:
              
              Position: ${title}
              Company: ${company}
              Description: ${description}
              ${additionalContext}
              
              Format your response ONLY as a JSON array of requirements with EXACTLY this structure:
              [
                {
                  "category": "Category name", 
                  "description": "Clear requirement description", 
                  "weight": number from 1-10, 
                  "isRequired": boolean
                },
                ...
              ]
              
              Return ONLY the JSON array with no explanation or additional text.`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content returned from API');
      }
      
      // Extract JSON array from response
      let requirementsArray;
      try {
        requirementsArray = JSON.parse(content);
      } catch (e) {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          requirementsArray = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse requirements from API response');
        }
      }
      
      // Validate and format the requirements
      const requirements = requirementsArray.map((req: any) => ({
        id: uuidv4(),
        original_id: uuidv4(),
        category: req.category || 'Technical Skills',
        description: req.description || 'Requirement',
        weight: typeof req.weight === 'number' ? req.weight : 7,
        isRequired: typeof req.isRequired === 'boolean' ? req.isRequired : true,
        user_id: currentUserId,
      }));
      
      return { requirements };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      toast.error('Failed to connect to AI service');
      throw error;
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
      console.log('AI Analyze Candidate Request:', { candidateData, requirements });
      
      if (!window.openAIKey) {
        toast.error('Please set your OpenAI API key first');
        throw new Error('OpenAI API key not set');
      }
      
      // Call the real OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.openAIKey || ''}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert talent evaluator specializing in detailed candidate assessment. Your task is to provide comprehensive, evidence-based evaluations with specific justifications for each score.

IMPORTANT EVALUATION GUIDELINES:
1. Provide concrete justifications for each score citing specific evidence from the resume
2. Use precise, factual language in justifications (e.g., "5+ years developing React applications" rather than "good experience")
3. For each requirement, identify specific examples that demonstrate competency or gaps
4. Maintain consistent evaluation standards across all skills and categories
5. Format justifications as concise, evidence-based statements similar to: "Strong analytical skills demonstrated through implementation of data-driven marketing campaigns that increased conversion by 25%"
6. Identify both strengths and potential development areas with specific examples`
            },
            {
              role: 'user',
              content: `Analyze the following resume against these job requirements:
              
Resume:
${candidateData.content || 'No resume content provided'}

Job Requirements (categorized):
${requirements.map(req => `- [${req.category}] ${req.description} (Weight: ${req.weight}, Required: ${req.isRequired})`).join('\n')}

For EACH requirement:
1. Provide a score from 1-10
2. Write a SPECIFIC justification (1-2 sentences) that:
   - Cites concrete evidence from the resume
   - References specific skills, tools, or experiences
   - Quantifies experience or achievements when possible
   - Uses terminology from the actual requirement

Format your response as JSON with this structure:
{
  "scores": [
    {
      "requirementId": "req_id",
      "score": number from 1-10,
      "notes": "Detailed justification with specific evidence from resume"
    }
  ],
  "overallScore": number from 1-10,
  "strengths": ["Specific strength with evidence"],
  "weaknesses": ["Specific weakness with evidence"],
  "cultureFit": {
    "score": number from 1-10,
    "notes": "Evidence-based analysis of cultural fit"
  },
  "leadershipPotential": {
    "score": number from 1-10,
    "notes": "Evidence-based analysis of leadership potential"
  },
  "skillAssessment": {
    "technicalSkills": ["Skill 1 with proficiency level", "Skill 2 with proficiency level"],
    "softSkills": ["Skill 1 with supporting evidence", "Skill 2 with supporting evidence"],
    "experienceEvaluation": "Detailed evaluation of experience relevance and depth"
  },
  "notes": "Overall comprehensive analysis"
}

Ensure each score has a specific, evidence-based justification that demonstrates WHY the candidate received that score based on their actual experience.`
            }
          ],
          temperature: 0.5,
          max_tokens: 3000
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content returned from API');
      }
      
      // Extract JSON object from response
      let analysisResult;
      try {
        analysisResult = JSON.parse(content);
      } catch (e) {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse analysis from API response');
        }
      }
      
      // Ensure the result has the expected structure and handle new fields
      const result: AICandidateAnalysisResponse = {
        scores: analysisResult.scores.map((score: any) => ({
          requirementId: score.requirementId,
          score: score.score,
          notes: score.notes || '',
        })) || [],
        overallScore: analysisResult.overallScore || 0,
        strengths: analysisResult.strengths || [],
        weaknesses: analysisResult.weaknesses || [],
        notes: analysisResult.notes || '',
        cultureFit: analysisResult.cultureFit?.score || 0,
        cultureFitNotes: analysisResult.cultureFit?.notes || '',
        leadershipPotential: analysisResult.leadershipPotential?.score || 0,
        leadershipNotes: analysisResult.leadershipPotential?.notes || '',
        technicalSkills: analysisResult.skillAssessment?.technicalSkills || [],
        softSkills: analysisResult.skillAssessment?.softSkills || [],
        experienceEvaluation: analysisResult.skillAssessment?.experienceEvaluation || ''
      };
      
      return result;
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
      console.log('AI Generate Report Request:', { jobInfo, candidates, additionalPrompt });
      
      if (!window.openAIKey) {
        toast.error('Please set your OpenAI API key first');
        throw new Error('OpenAI API key not set');
      }
      
      // Sort candidates by overall score
      const sortedCandidates = [...candidates].sort(
        (a, b) => b.overallScore - a.overallScore
      );
      
      // Call the real OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.openAIKey || ''}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an AI specialized in HR and recruitment. Your task is to generate a candidate ranking report.`
            },
            {
              role: 'user',
              content: `Generate a candidate ranking report for the following position:
              
              Position: ${jobInfo.title}
              Company: ${jobInfo.company}
              Description: ${jobInfo.description}
              
              Candidates:
              ${sortedCandidates.map((c, i) => `
              ${i + 1}. ${c.name} (Score: ${c.overallScore}/10)
              Strengths: ${c.strengths.join(', ')}
              Weaknesses: ${c.weaknesses.join(', ')}
              `).join('\n')}
              
              ${additionalPrompt ? `Additional context: ${additionalPrompt}` : ''}
              
              Generate a detailed report in Markdown format that ranks the candidates, explains their strengths and weaknesses, and provides recommendations.`
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content returned from API');
      }
      
      return { content };
    } catch (error) {
      console.error('Error generating report:', error);
      throw new Error('Failed to generate candidate ranking report');
    }
  }
}

// Upload files to Supabase storage
export const uploadFiles = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(async (file) => {
      const filePath = `resumes/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);
      
      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);
      
      return publicUrl;
    });
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading files:', error);
    toast.error('Failed to upload files');
    throw error;
  }
};

// Extract text from a file (resume)
export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    // In a production environment, this would use a document parsing service
    const formData = new FormData();
    formData.append('file', file);
    
    // Use a parsing service or implement server-side parsing
    // For now, return a placeholder
    return `Text extracted from ${file.name}. In production, this would be actual parsed content.`;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from ${file.name}`);
  }
};
