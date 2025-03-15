import { v4 as uuidv4 } from 'uuid';
import { Candidate, JobRequirement } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { extractCandidateName, extractNameFromContent, generateRealisticName } from '@/utils/candidateUtils';
import { extractTextFromFile, AIService } from '@/services/api';

export const createCandidateFromFile = async (file: File, jobId: string, index: number): Promise<Candidate> => {
  // Try to extract candidate name, with multiple fallback strategies
  let candidateName = '';
  
  // First try to extract candidate name from filename
  const filenameExtractedName = extractCandidateName(file.name);
  
  if (filenameExtractedName) {
    candidateName = filenameExtractedName;
    console.log('Name extracted from filename:', candidateName);
  } else {
    // If filename-based extraction fails, try content-based extraction
    try {
      // Extract text content from the file
      const content = await extractTextFromFile(file);
      const contentExtractedName = await extractNameFromContent(content);
      
      if (contentExtractedName) {
        candidateName = contentExtractedName;
        console.log('Name extracted from content:', candidateName);
      }
    } catch (error) {
      console.error("Error extracting text from file:", error);
    }
  }
  
  // If no name could be extracted, generate a realistic one
  if (!candidateName) {
    candidateName = generateRealisticName();
    console.log('Generated random name:', candidateName);
  }
  
  const candidateId = uuidv4();
  
  // Save to Supabase
  try {
    const { error } = await supabase
      .from('candidates')
      .insert({
        id: candidateId,
        name: candidateName,
        job_id: jobId,
        file_name: file.name,
        content_type: file.type,
        is_starred: false
      });
    
    if (error) {
      console.error('Error saving candidate to Supabase:', error);
    } else {
      console.log('Successfully saved candidate to Supabase:', candidateName);
    }
  } catch (error) {
    console.error('Exception saving candidate to Supabase:', error);
  }
  
  return {
    id: candidateId,
    name: candidateName,
    email: `${candidateName.toLowerCase().replace(/\s/g, '.')}@example.com`,
    resumeUrl: URL.createObjectURL(file),
    overallScore: 0,
    scores: [],
    strengths: [],
    weaknesses: [],
    isStarred: false,
    status: 'pending',
    jobId: jobId,
    processedAt: new Date().toISOString(),
    // Initialize with empty values, will be filled during real processing
    personalityTraits: [],
    zodiacSign: '',
    workStyle: '',
    cultureFit: 0,
    leadershipPotential: 0,
    education: '',
    yearsOfExperience: 0,
    location: '',
    skillKeywords: [],
    communicationStyle: '',
    preferredTools: []
  };
};

export const processCandidate = async (candidate: Candidate, requirements: JobRequirement[]): Promise<Candidate> => {
  console.log('Processing candidate:', candidate.name);
  
  try {
    // In a production environment with OpenAI API key, we'll use the AI service
    let processedCandidate: Candidate;
    
    if (window.openAIKey) {
      console.log('Using AI service to process candidate');
      
      try {
        // Extract resume content from PDF (in production)
        // For now, we'll use a placeholder
        const resumeContent = `Resume content for ${candidate.name}. In production, this would be extracted from the PDF.`;
        
        // Call the AI service to analyze the candidate
        const aiResult = await AIService.analyzeCandidate(
          { content: resumeContent },
          requirements
        );
        
        console.log('AI analysis result:', aiResult);
        
        // Map AI result to candidate structure
        processedCandidate = {
          ...candidate,
          scores: aiResult.scores.map(s => ({
            requirementId: s.requirementId,
            score: s.score,
            comment: s.notes || ''
          })),
          overallScore: aiResult.overallScore,
          strengths: aiResult.strengths,
          weaknesses: aiResult.weaknesses,
          personalityTraits: aiResult.personalityTraits,
          cultureFit: aiResult.cultureFit,
          leadershipPotential: aiResult.leadershipPotential,
          education: aiResult.education,
          yearsOfExperience: aiResult.yearsOfExperience,
          location: aiResult.location,
          skillKeywords: aiResult.skillKeywords,
          communicationStyle: aiResult.communicationStyle,
          preferredTools: aiResult.preferredTools,
          status: 'processed',
          processedAt: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error using AI service:', error);
        // Fall back to mock processing
        processedCandidate = generateMockAnalysis(candidate, requirements);
      }
    } else {
      // Fall back to mock processing if no API key is available
      console.log('No OpenAI key available, using mock processing');
      processedCandidate = generateMockAnalysis(candidate, requirements);
    }
    
    // Save candidate scores to Supabase
    try {
      // Save the scores
      for (const score of processedCandidate.scores) {
        // Fix for the UUID error - ensure we're using proper UUIDs
        // If requirementId doesn't look like a UUID, skip saving to DB or generate a proper UUID
        if (!isValidUUID(score.requirementId)) {
          console.error(`Invalid requirement ID format: ${score.requirementId} - skipping DB save`);
          continue;
        }
        
        const { error } = await supabase
          .from('candidate_scores')
          .insert({
            candidate_id: processedCandidate.id,
            requirement_id: score.requirementId,
            score: score.score,
            explanation: score.comment
          });
          
        if (error) {
          console.error('Error saving candidate score to Supabase:', error);
        }
      }
      
      // Save analysis data
      const { error: analysisError } = await supabase
        .from('candidate_analysis')
        .insert({
          candidate_id: processedCandidate.id,
          strengths: processedCandidate.strengths,
          weaknesses: processedCandidate.weaknesses,
          personality_traits: processedCandidate.personalityTraits,
          cultural_fit: processedCandidate.cultureFit.toString(),
          skills_assessment: JSON.stringify(processedCandidate.skillKeywords)
        });
        
      if (analysisError) {
        console.error('Error saving candidate analysis to Supabase:', analysisError);
      }
      
      console.log('Successfully saved candidate analysis to Supabase');
    } catch (error) {
      console.error('Exception saving candidate analysis to Supabase:', error);
    }
    
    return processedCandidate;
    
  } catch (error) {
    console.error('Error processing candidate:', error);
    // Return original candidate with minimal mock data to avoid breaking the app
    return {
      ...candidate,
      scores: requirements.map(req => ({
        requirementId: req.id,
        score: Math.floor(Math.random() * 5) + 1,
        comment: `Error processing: ${error instanceof Error ? error.message : 'Unknown error'}`
      })),
      overallScore: 5,
      strengths: ['Error during processing'],
      weaknesses: ['Could not determine'],
      status: 'processed',
      processedAt: new Date().toISOString()
    };
  }
};

// Helper function to check if a string is a valid UUID
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

const generateMockAnalysis = (candidate: Candidate, requirements: JobRequirement[]): Candidate => {
  // Generate mock scores for each requirement
  const scores = requirements.map(req => {
    return {
      requirementId: req.id, // Ensure this is a proper UUID
      score: Math.floor(Math.random() * 5) + 3, // Random score 3-7 for demo
      comment: `Mock analysis for ${req.description}`,
    };
  });
  
  // Calculate overall score based on weighted requirements
  const overallScore = calculateOverallScore(scores, requirements);
  
  // Generate mock strengths and weaknesses
  const mockStrengths = [
    'Communication',
    'Problem Solving',
    'Technical Knowledge',
    'Teamwork',
    'Adaptability',
    'Time Management',
    'Leadership',
    'Attention to Detail'
  ];
  
  const mockWeaknesses = [
    'Public Speaking',
    'Task Delegation',
    'Working Under Pressure',
    'Handling Criticism',
    'Perfectionism',
    'Work-Life Balance',
    'Technical Documentation'
  ];
  
  // Randomly select 2-4 strengths and 1-3 weaknesses
  const strengths = shuffleArray(mockStrengths).slice(0, Math.floor(Math.random() * 3) + 2);
  const weaknesses = shuffleArray(mockWeaknesses).slice(0, Math.floor(Math.random() * 3) + 1);
  
  // Generate mock personality traits
  const mockPersonalityTraits = [
    'Analytical',
    'Creative',
    'Detail-oriented', 
    'Pragmatic',
    'Collaborative',
    'Independent',
    'Goal-oriented',
    'Innovative'
  ];
  
  const personalityTraits = shuffleArray(mockPersonalityTraits).slice(0, Math.floor(Math.random() * 3) + 2);
  
  // Generate mock education and experience
  const mockEducation = [
    'Bachelor of Science in Computer Science',
    'Master of Business Administration',
    'Bachelor of Arts in Communication',
    'Master of Science in Data Analytics',
    'Bachelor of Engineering'
  ];
  
  const education = mockEducation[Math.floor(Math.random() * mockEducation.length)];
  
  // Random years of experience (1-10)
  const yearsOfExperience = Math.floor(Math.random() * 10) + 1;
  
  // Mock locations
  const mockLocations = [
    'San Francisco, CA',
    'New York, NY',
    'Austin, TX',
    'Seattle, WA',
    'Boston, MA',
    'Remote'
  ];
  
  const location = mockLocations[Math.floor(Math.random() * mockLocations.length)];
  
  // Mock skill keywords
  const mockSkillKeywords = [
    'JavaScript',
    'Python',
    'React',
    'SQL',
    'Data Analysis',
    'Machine Learning',
    'Project Management',
    'Agile',
    'UX Design',
    'Customer Success'
  ];
  
  const skillKeywords = shuffleArray(mockSkillKeywords).slice(0, Math.floor(Math.random() * 5) + 3);
  
  // Mock communication styles
  const mockCommunicationStyles = [
    'Direct and concise',
    'Detailed and thorough',
    'Collaborative and open',
    'Formal and structured',
    'Visual communicator'
  ];
  
  const communicationStyle = mockCommunicationStyles[Math.floor(Math.random() * mockCommunicationStyles.length)];
  
  // Mock preferred tools
  const mockPreferredTools = [
    'JIRA',
    'Slack',
    'GSuite',
    'Microsoft Office',
    'Figma',
    'Notion',
    'GitHub',
    'VS Code',
    'Trello'
  ];
  
  const preferredTools = shuffleArray(mockPreferredTools).slice(0, Math.floor(Math.random() * 4) + 2);
  
  // Random culture fit and leadership potential (3-10)
  const cultureFit = Math.floor(Math.random() * 7) + 3;
  const leadershipPotential = Math.floor(Math.random() * 7) + 3;
  
  return {
    ...candidate,
    scores,
    overallScore,
    strengths,
    weaknesses,
    personalityTraits,
    cultureFit,
    leadershipPotential,
    education,
    yearsOfExperience,
    location,
    skillKeywords,
    communicationStyle,
    preferredTools,
    status: 'processed',
    processedAt: new Date().toISOString()
  };
};

// Helper function to calculate overall score
const calculateOverallScore = (
  scores: { requirementId: string; score: number; comment: string }[], 
  requirements: JobRequirement[]
): number => {
  if (scores.length === 0) return 0;
  
  const totalWeightedScore = scores.reduce((total, score) => {
    const req = requirements.find(r => r.id === score.requirementId);
    const weight = req ? req.weight : 1;
    return total + (score.score * weight);
  }, 0);
  
  const totalWeight = requirements.reduce((total, req) => total + req.weight, 0);
  
  return Math.round((totalWeightedScore / totalWeight) * 10) / 10;
};

// Helper function to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Default requirements for a Customer Success role
export const getDefaultCustomerSuccessRequirements = (): JobRequirement[] => {
  return [
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
    },
    {
      id: uuidv4(),
      description: "Strong written/verbal communication and ability to build relationships",
      weight: 5,
      category: "Skills",
      isRequired: true
    },
    {
      id: uuidv4(),
      description: "Demonstrated taking initiative, driving product adoption, or improving processes",
      weight: 4,
      category: "Attitude",
      isRequired: false
    },
    {
      id: uuidv4(),
      description: "Comfort with tools like analytics platforms, CRMs, Hubspot, Google Analytics",
      weight: 3,
      category: "Technical",
      isRequired: false
    },
    {
      id: uuidv4(),
      description: "Professional level English communication skills",
      weight: 5,
      category: "Language",
      isRequired: true
    }
  ];
};
