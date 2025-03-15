
import React from 'react';
import { Award, Trophy } from 'lucide-react';
import { JobRequirement } from '@/contexts/JobContext';

interface SkillScore {
  requirementId: string;
  score: number;
}

interface CandidateSkillAssessmentProps {
  scores: SkillScore[];
  requirements: JobRequirement[];
  topScorers: { [requirementId: string]: boolean };
}

const CandidateSkillAssessment = ({ scores, requirements, topScorers }: CandidateSkillAssessmentProps) => {
  const getScoreLevelClass = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-blue-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="mt-2 border-t border-gray-100 dark:border-gray-800 pt-3">
      <h4 className="text-sm font-medium mb-3 flex items-center">
        <Award className="h-4 w-4 text-blue-500 mr-1" />
        Skill Assessment
      </h4>
      <div className="space-y-3">
        {scores.map((score, index) => {
          const requirement = requirements.find(req => req.id === score.requirementId);
          if (!requirement) return null;
          
          const isTop = topScorers[score.requirementId];
          
          return (
            <div key={index} className={`space-y-1 p-2 rounded-md ${isTop ? 'bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30' : ''}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {requirement.description} 
                    {requirement.isRequired && (
                      <span className="text-xs text-red-500 ml-1">*</span>
                    )}
                  </span>
                  {isTop && (
                    <Trophy className="h-4 w-4 text-yellow-500 ml-1" aria-label="Top score among candidates" />
                  )}
                </div>
                <span className="text-sm font-medium">{score.score}/10</span>
              </div>
              <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getScoreLevelClass(score.score)} transition-all duration-500`}
                  style={{ width: `${score.score * 10}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CandidateSkillAssessment;
