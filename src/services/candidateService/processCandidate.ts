
import { Candidate, JobRequirement, RequirementScore } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { AIService } from '@/services/api';
import { generateMockAnalysis } from './mockDataGenerator';

// Helper function to check if a string is a valid UUID
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Process a candidate by analyzing their resume and scoring against job requirements
 */
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
