
import { Candidate, JobRequirement, RequirementScore } from '@/types/job.types';
import { supabase } from '@/integrations/supabase/client';
import { AIService } from '@/services/api';
import { v4 as uuidv4 } from 'uuid';

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
        
        // Create a map of requirement IDs for quick lookup
        const requirementMap = new Map<string | number, JobRequirement>();
        requirements.forEach(req => {
          requirementMap.set(req.id, req);
        });
        
        // Map AI result to candidate structure, ensuring we use valid UUID requirement IDs
        const validScores: RequirementScore[] = [];
        
        if (aiResult.scores && Array.isArray(aiResult.scores)) {
          // Try to map the AI results to our requirements
          aiResult.scores.forEach((score, index) => {
            // Find the matching requirement for this score
            // The AI might return scores with IDs like "req_1", "req1", or just "1"
            // Try different potential mappings
            let requirementId: string | undefined;
            
            if (score.requirementId && requirementMap.has(score.requirementId)) {
              // Direct match (ideal scenario)
              requirementId = score.requirementId as string;
            } else if (index < requirements.length) {
              // Fall back to index-based mapping
              requirementId = requirements[index].id;
            }
            
            if (requirementId && isValidUUID(requirementId)) {
              validScores.push({
                requirementId,
                score: score.score,
                comment: score.notes || 'N/A'
              });
            } else {
              console.log(`Invalid requirement ID format: ${score.requirementId} - using index-based mapping`);
              if (index < requirements.length) {
                validScores.push({
                  requirementId: requirements[index].id,
                  score: score.score,
                  comment: score.notes || 'N/A'
                });
              }
            }
          });
        }
        
        processedCandidate = {
          ...candidate,
          scores: validScores,
          overallScore: aiResult.overallScore,
          strengths: aiResult.strengths || ['N/A'],
          weaknesses: aiResult.weaknesses || ['N/A'],
          personalityTraits: aiResult.personalityTraits || ['N/A'],
          cultureFit: aiResult.cultureFit || 0,
          leadershipPotential: aiResult.leadershipPotential || 0,
          education: aiResult.education || 'N/A',
          yearsOfExperience: aiResult.yearsOfExperience || 0,
          location: aiResult.location || 'N/A',
          skillKeywords: aiResult.skillKeywords || ['N/A'],
          communicationStyle: aiResult.communicationStyle || 'N/A',
          preferredTools: aiResult.preferredTools || ['N/A'],
          status: 'processed',
          processedAt: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error using AI service:', error);
        // Fall back to N/A values
        processedCandidate = createEmptyCandidate(candidate, requirements);
      }
    } else {
      // Fall back to N/A values if no API key is available
      console.log('No OpenAI key available, using N/A values');
      processedCandidate = createEmptyCandidate(candidate, requirements);
    }
    
    // Save candidate scores to Supabase
    try {
      // First check if analysis already exists for this candidate
      const { data: existingAnalysis } = await supabase
        .from('candidate_analysis')
        .select('candidate_id')
        .eq('candidate_id', processedCandidate.id)
        .single();
      
      if (!existingAnalysis) {
        // Save analysis data if it doesn't exist yet
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
        } else {
          console.log('Successfully saved candidate analysis to Supabase');
        }
      } else {
        // Update analysis if it already exists
        const { error: updateError } = await supabase
          .from('candidate_analysis')
          .update({
            strengths: processedCandidate.strengths,
            weaknesses: processedCandidate.weaknesses,
            personality_traits: processedCandidate.personalityTraits,
            cultural_fit: processedCandidate.cultureFit.toString(),
            skills_assessment: JSON.stringify(processedCandidate.skillKeywords),
            updated_at: new Date().toISOString()
          })
          .eq('candidate_id', processedCandidate.id);
          
        if (updateError) {
          console.error('Error updating candidate analysis in Supabase:', updateError);
        } else {
          console.log('Successfully updated candidate analysis in Supabase');
        }
      }
      
      // Delete previous scores for this candidate to avoid duplicates
      await supabase
        .from('candidate_scores')
        .delete()
        .eq('candidate_id', processedCandidate.id);
      
      // Save the scores
      for (const score of processedCandidate.scores) {
        // Skip saving if requirementId isn't a valid UUID
        if (!isValidUUID(score.requirementId)) {
          console.log(`Invalid requirement ID format: ${score.requirementId} - skipping DB save`);
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
      
    } catch (error) {
      console.error('Exception saving candidate analysis to Supabase:', error);
    }
    
    return processedCandidate;
    
  } catch (error) {
    console.error('Error processing candidate:', error);
    // Return original candidate with N/A values to avoid breaking the app
    return createEmptyCandidate(candidate, requirements);
  }
};

/**
 * Create a candidate with N/A values for all fields
 */
const createEmptyCandidate = (candidate: Candidate, requirements: JobRequirement[]): Candidate => {
  return {
    ...candidate,
    scores: requirements.map(req => ({
      requirementId: req.id,
      score: 0,
      comment: 'N/A'
    })),
    overallScore: 0,
    strengths: ['N/A'],
    weaknesses: ['N/A'],
    personalityTraits: ['N/A'],
    cultureFit: 0,
    leadershipPotential: 0,
    education: 'N/A',
    yearsOfExperience: 0,
    location: 'N/A',
    skillKeywords: ['N/A'],
    communicationStyle: 'N/A',
    preferredTools: ['N/A'],
    status: 'processed',
    processedAt: new Date().toISOString()
  };
};
