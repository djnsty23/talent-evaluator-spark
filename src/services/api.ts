import { JobRequirement } from '@/types/job.types';

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
          id: 'req_1',
          description: "Direct experience in customer success or a related role",
          weight: 5,
          category: "Experience",
          isRequired: true
        },
        {
          id: 'req_2',
          description: "Experience working in SaaS and/or familiarity with A/B testing, experimentation, or CRO",
          weight: 4,
          category: "Technical",
          isRequired: true
        },
        {
          id: 'req_3',
          description: "Ability to analyze customer pain points, interpret data, and provide solutions",
          weight: 5,
          category: "Skills",
          isRequired: true
        }
      ];
      
      return { requirements: mockRequirements };
      
      // In a real implementation, we would call OpenAI here
      /*
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.openAIKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI recruiter generating job requirements.'
            },
            {
              role: 'user',
              content: `Generate job requirements for a ${data.jobInfo.title} position at ${data.jobInfo.company}.
                          Job Description: ${data.jobInfo.description}
                          Context Files: ${data.contextFiles.join(', ')}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      const responseData = await response.json();
      
      // Parse the OpenAI response
      // This would need to be implemented to extract structured data
      // from the OpenAI response text
      return parseOpenAIResponse(responseData.choices[0].message.content);
      */
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

      // Create the prompt for OpenAI
      const prompt = `
        Analyze the following candidate resume for a Customer Success position. 
        Score the candidate on each requirement from 1-10 (10 being the best).
        
        Resume Content:
        ${candidateData.content}
        
        Requirements to score:
        ${requirementsText}
        
        Provide:
        1. A score for each requirement (1-10)
        2. Brief notes explaining each score
        3. Overall score (1-10)
        4. Three key strengths of the candidate
        5. Two areas of improvement
        6. Additional insights about personality traits, work style, and culture fit
      `;

      // Mock OpenAI response for development
      const mockResponse = {
        scores: numberedRequirements.map((req, i) => ({
          requirementId: req.id, // Use actual UUID from requirements
          score: Math.floor(Math.random() * 4) + 6, // 6-9
          notes: `The candidate has ${Math.random() > 0.7 ? 'excellent' : 'good'} experience in ${req.description}.`
        })),
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
      
      // In a real implementation, we would call OpenAI here
      /* 
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.openAIKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI recruiter analyzing candidates.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      const data = await response.json();
      
      // Parse the OpenAI response
      // This would need to be implemented to extract structured data
      // from the OpenAI response text
      return parseOpenAIResponse(data.choices[0].message.content);
      */
    } catch (error) {
      console.error('Error in AI analysis:', error);
      throw error;
    }
  }
}

/**
 * Utility to parse OpenAI response text into structured data
 * This would be implemented in a production version
 */
function parseOpenAIResponse(text: string): any {
  // Implementation would depend on the format of the OpenAI response
  return {}; 
}

export const extractTextFromFile = AIService.extractTextFromFile;
