import React from 'react';
import { Award, Trophy } from 'lucide-react';
import { JobRequirement } from '@/types/job.types';
import styles from './CandidateSkillAssessment.module.css';

interface SkillScore {
  requirementId: string;
  score: number;
  comment?: string;
}

interface GroupedSkills {
  [category: string]: {
    requirement: JobRequirement;
    score: SkillScore;
    isTopScore: boolean;
  }[];
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

  const getWidthClass = (score: number) => {
    // Round to nearest 10
    const roundedScore = Math.round(score);
    return styles[`width${roundedScore * 10}`] || styles.width0;
  };

  // Group skills by category to ensure consistent display order
  const groupedSkills: GroupedSkills = {};

  // Group the skills by category
  scores.forEach(score => {
    const requirement = requirements.find(req => req.id === score.requirementId);
    if (!requirement) return;

    const category = requirement.category || 'Uncategorized';
    if (!groupedSkills[category]) {
      groupedSkills[category] = [];
    }

    groupedSkills[category].push({
      requirement,
      score,
      isTopScore: !!topScorers[score.requirementId]
    });
  });

  // Sort categories in a specific order
  const categoryOrder = [
    'Skills', 
    'Technical', 
    'Experience',
    'Language',
    'Attitude',
    'Uncategorized'
  ];
  
  // Sort the categories
  const sortedCategories = Object.keys(groupedSkills).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b); // Both not in the order list
    if (indexA === -1) return 1; // A not in order list
    if (indexB === -1) return -1; // B not in order list
    return indexA - indexB; // Both in order list
  });

  return (
    <div className="mt-2 border-t border-gray-100 dark:border-gray-800 pt-3">
      <h4 className="text-sm font-medium mb-3 flex items-center">
        <Award className="h-4 w-4 text-blue-500 mr-1" />
        Skill Assessment
      </h4>

      {sortedCategories.map(category => (
        <div key={category} className="mb-4">
          <h5 className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">
            {category}
          </h5>
          <div className="space-y-3">
            {groupedSkills[category]
              // Sort within category by requirement weight (higher weights first)
              .sort((a, b) => b.requirement.weight - a.requirement.weight)
              .map(({ requirement, score, isTopScore }, index) => (
                <div 
                  key={`${category}-${index}`} 
                  className={`space-y-1 p-2 rounded-md ${isTopScore ? 'bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {requirement.description}
                        {requirement.isRequired && (
                          <span className="text-xs text-red-500 ml-1">*</span>
                        )}
                      </span>
                      {isTopScore && (
                        <Trophy className="h-4 w-4 text-yellow-500 ml-1" aria-label="Top score among candidates" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{score.score}/10</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`${styles.progressBar} ${getScoreLevelClass(score.score)} ${getWidthClass(score.score)}`}
                    />
                  </div>
                  {score.comment && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {score.comment}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}

      {sortedCategories.length === 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          No skills assessed yet
        </div>
      )}
    </div>
  );
};

export default CandidateSkillAssessment;
