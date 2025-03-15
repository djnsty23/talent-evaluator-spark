
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  personalityTraits: string[];
  cultureFit: number;
  leadershipPotential: number;
  education: string;
  yearsOfExperience: number;
  location: string;
  skillKeywords: string[];
  communicationStyle: string;
  preferredTools: string[];
}

interface AIReportGenerationResponse {
  content: string;
  candidateRankings: {
    id: string;
    name: string;
    overallScore: number;
    rank: number;
    keyStrengths: string[];
    developmentAreas: string[];
    fitAssessment: string;
    recommendation: string;
  }[];
  topCandidates: string[];
  comparisonMatrix: {
    requirementId: string;
    description: string;
    candidateScores: {
      candidateId: string;
      candidateName: string;
      score: number;
    }[];
  }[];
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
      const requirements = requirementsArray.map((req: any, index: number) => ({
        id: `req_${Date.now()}_${index}`,
        category: req.category || 'Technical Skills',
        description: req.description || 'Requirement',
        weight: typeof req.weight === 'number' ? req.weight : 7,
        isRequired: typeof req.isRequired === 'boolean' ? req.isRequired : true,
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
              content: `You are an AI specialized in HR and recruitment. Your task is to analyze a resume against job requirements. You must return a complete JSON object with ALL fields filled out.`
            },
            {
              role: 'user',
              content: `Analyze the following resume against these job requirements:
              
              Resume: ${candidateData.content || 'No resume content provided'}
              
              Requirements:
              ${requirements.map(req => `- ${req.description} (Weight: ${req.weight}, Required: ${req.isRequired})`).join('\n')}
              
              Format your response ONLY as a JSON object with EXACTLY this structure:
              {
                "scores": [
                  {
                    "requirementId": "req_id",
                    "score": number from 1-10,
                    "notes": "Explanation of score"
                  },
                  ...
                ],
                "overallScore": number from 1-10,
                "strengths": ["Strength 1", "Strength 2", ...],
                "weaknesses": ["Weakness 1", "Weakness 2", ...],
                "notes": "Overall analysis notes",
                "personalityTraits": ["Trait 1", "Trait 2", ...],
                "cultureFit": number from 1-10, 
                "leadershipPotential": number from 1-10,
                "education": "Education details",
                "yearsOfExperience": number,
                "location": "Location",
                "skillKeywords": ["Skill 1", "Skill 2", ...],
                "communicationStyle": "Description of communication style",
                "preferredTools": ["Tool 1", "Tool 2", ...]
              }
              
              ALL fields are mandatory and must be filled with appropriate values. Return ONLY the JSON object with no explanation or additional text.`
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
      
      // Ensure the result has the expected structure with default values for missing fields
      const result: AICandidateAnalysisResponse = {
        scores: analysisResult.scores || [],
        overallScore: analysisResult.overallScore || 0,
        strengths: analysisResult.strengths || [],
        weaknesses: analysisResult.weaknesses || [],
        notes: analysisResult.notes || '',
        personalityTraits: analysisResult.personalityTraits || [],
        cultureFit: analysisResult.cultureFit || 5,
        leadershipPotential: analysisResult.leadershipPotential || 5,
        education: analysisResult.education || 'Not specified',
        yearsOfExperience: analysisResult.yearsOfExperience || 0,
        location: analysisResult.location || 'Not specified',
        skillKeywords: analysisResult.skillKeywords || [],
        communicationStyle: analysisResult.communicationStyle || 'Not specified',
        preferredTools: analysisResult.preferredTools || []
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
      scores: Array<{
        requirementId: string;
        score: number;
        comment?: string;
      }>;
      cultureFit?: number;
      leadershipPotential?: number;
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
              content: `You are an AI specialized in HR and recruitment. Your task is to generate a detailed candidate ranking report with specific JSON structure.`
            },
            {
              role: 'user',
              content: `Generate a candidate ranking report for the following position:
              
              Position: ${jobInfo.title}
              Company: ${jobInfo.company}
              Description: ${jobInfo.description}
              
              Requirements:
              ${jobInfo.requirements.map(r => `- ${r.description} (Weight: ${r.weight}, Required: ${r.isRequired ? 'Yes' : 'No'})`).join('\n')}
              
              Candidates:
              ${sortedCandidates.map((c, i) => `
              ${i + 1}. ${c.name} (Score: ${c.overallScore}/10)
              Strengths: ${c.strengths.join(', ')}
              Weaknesses: ${c.weaknesses.join(', ')}
              Culture Fit: ${c.cultureFit || 'N/A'}/10
              Leadership: ${c.leadershipPotential || 'N/A'}/10
              Requirement Scores: ${c.scores.map(s => {
                const req = jobInfo.requirements.find(r => r.id === s.requirementId);
                return req ? `${req.description}: ${s.score}/10` : '';
              }).filter(Boolean).join(', ')}
              `).join('\n')}
              
              ${additionalPrompt ? `Additional context: ${additionalPrompt}` : ''}
              
              Return a JSON response with the following structure:
              {
                "content": "Full markdown report content with detailed analysis",
                "candidateRankings": [
                  {
                    "id": "candidate_id",
                    "name": "Candidate Name",
                    "overallScore": number,
                    "rank": number,
                    "keyStrengths": ["Strength 1", "Strength 2", ...],
                    "developmentAreas": ["Area 1", "Area 2", ...],
                    "fitAssessment": "Brief assessment of overall fit",
                    "recommendation": "Hire/Consider/Reject recommendation with rationale"
                  },
                  ...
                ],
                "topCandidates": ["candidate_id1", "candidate_id2", "candidate_id3"],
                "comparisonMatrix": [
                  {
                    "requirementId": "requirement_id",
                    "description": "Requirement description",
                    "candidateScores": [
                      {
                        "candidateId": "candidate_id",
                        "candidateName": "Candidate Name",
                        "score": number
                      },
                      ...
                    ]
                  },
                  ...
                ]
              }
              
              ALL fields must be completed with appropriate values. Your response should ONLY contain valid JSON with no additional text.`
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
      
      // Parse JSON response
      let reportData: AIReportGenerationResponse;
      try {
        reportData = JSON.parse(content);
      } catch (e) {
        // Try to extract JSON if parsing fails
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          reportData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse report data from API response');
        }
      }
      
      // Ensure all expected properties exist
      if (!reportData.content) {
        throw new Error('Missing report content in API response');
      }
      
      return {
        content: reportData.content,
        candidateRankings: reportData.candidateRankings || [],
        topCandidates: reportData.topCandidates || [],
        comparisonMatrix: reportData.comparisonMatrix || []
      };
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
