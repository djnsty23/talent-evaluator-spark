
import { v4 as uuidv4 } from 'uuid';
import { Candidate } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { extractCandidateName, extractNameFromContent, generateRealisticName } from '@/utils/candidateUtils';
import { extractTextFromFile } from '@/services/aiService';

/**
 * Creates a new candidate from an uploaded file
 */
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
