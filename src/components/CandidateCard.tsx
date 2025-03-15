
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Candidate, JobRequirement } from '@/contexts/JobContext';

// Import our new component parts
import CandidateCardHeader from './candidate/CandidateCardHeader';
import CandidateCardInfo from './candidate/CandidateCardInfo';
import CandidateStrengthsWeaknesses from './candidate/CandidateStrengthsWeaknesses';
import CandidatePersonalityTraits from './candidate/CandidatePersonalityTraits';
import CandidateCultureFit from './candidate/CandidateCultureFit';
import CandidateSkillAssessment from './candidate/CandidateSkillAssessment';
import CandidateResumeButton from './candidate/CandidateResumeButton';
import CandidateCardFooter from './candidate/CandidateCardFooter';

interface CandidateCardProps {
  candidate: Candidate;
  requirements: JobRequirement[];
  onStar: (isStarred: boolean) => void;
  onProcess: () => void;
  onDelete: () => void;
  onViewDetails?: () => void;
  isProcessing?: boolean;
  isTopScorer?: { [requirementId: string]: boolean };
  allCandidatesData?: Candidate[];
  jobId?: string;
}

const CandidateCard = ({
  candidate,
  requirements,
  onStar,
  onProcess,
  onDelete,
  onViewDetails,
  isProcessing = false,
  isTopScorer = {},
  allCandidatesData = [],
  jobId,
}: CandidateCardProps) => {
  const [topScorers, setTopScorers] = useState<{ [requirementId: string]: boolean }>({});
  const isProcessed = candidate.scores.length > 0;

  useEffect(() => {
    if (allCandidatesData.length > 0) {
      const bestScores: { [requirementId: string]: number } = {};
      const scorerIds: { [requirementId: string]: string } = {};
      
      allCandidatesData.forEach(c => {
        if (c.scores.length > 0) {
          c.scores.forEach(score => {
            if (!bestScores[score.requirementId] || score.score > bestScores[score.requirementId]) {
              bestScores[score.requirementId] = score.score;
              scorerIds[score.requirementId] = c.id;
            }
          });
        }
      });
      
      const newTopScorers: { [requirementId: string]: boolean } = {};
      if (candidate.scores.length > 0) {
        candidate.scores.forEach(score => {
          if (scorerIds[score.requirementId] === candidate.id && 
              bestScores[score.requirementId] > 0) {
            newTopScorers[score.requirementId] = true;
          }
        });
      }
      
      setTopScorers(newTopScorers);
    }
  }, [allCandidatesData, candidate.id, candidate.scores]);

  return (
    <Card className="w-full overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
      <CandidateCardHeader
        candidate={candidate}
        onStar={onStar}
      />
      
      <CardContent className="p-4 pt-3">
        <CandidateCardInfo
          isProcessed={isProcessed}
          processedAt={candidate.processedAt}
        />
        
        {isProcessed && (
          <>
            <CandidateStrengthsWeaknesses
              strengths={candidate.strengths}
              weaknesses={candidate.weaknesses}
            />
            
            {candidate.personalityTraits && candidate.personalityTraits.length > 0 && (
              <CandidatePersonalityTraits
                personalityTraits={candidate.personalityTraits}
              />
            )}
            
            <CandidateCultureFit
              cultureFit={candidate.cultureFit}
              leadershipPotential={candidate.leadershipPotential}
            />
            
            <CandidateSkillAssessment
              scores={candidate.scores}
              requirements={requirements}
              topScorers={topScorers}
            />
          </>
        )}
        
        <CandidateResumeButton resumeUrl={candidate.resumeUrl} />
      </CardContent>
      
      <CandidateCardFooter
        isProcessed={isProcessed}
        isProcessing={isProcessing}
        onProcess={onProcess}
        onViewDetails={onViewDetails}
        jobId={jobId}
      />
    </Card>
  );
};

export default CandidateCard;
