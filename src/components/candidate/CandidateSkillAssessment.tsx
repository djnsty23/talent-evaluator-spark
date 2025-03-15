import React, { useState } from 'react';
import { Award, Trophy, ChevronDown, ChevronUp, Info } from 'lucide-react';
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
  const [expandedNotes, setExpandedNotes] = useState<{[key: string]: boolean}>({});

  const toggleNote = (id: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getScoreLevelClass = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-blue-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreTextClass = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
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

  // Sort categories to match the evaluation grid
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
              .map(({ requirement, score, isTopScore }, index) => {
                const noteId = `${category}-${index}`;
                const isExpanded = expandedNotes[noteId] || false;
                
                return (
                  <div 
                    key={noteId} 
                    className={`space-y-1 p-2 rounded-md ${isTopScore ? 'bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center flex-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate mr-2">
                          {requirement.description}
                          {requirement.isRequired && (
                            <span className="text-xs text-red-500 ml-1">*</span>
                          )}
                        </span>
                        {isTopScore && (
                          <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0" aria-label="Top score among candidates" />
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${getScoreTextClass(score.score)}`}>{score.score}/10</span>
                        
                        {score.comment && (
                          <button 
                            onClick={() => toggleNote(noteId)} 
                            className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle score justification"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`${styles.progressBar} ${getScoreLevelClass(score.score)} ${getWidthClass(score.score)}`}
                      />
                    </div>
                    
                    {score.comment && isExpanded && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start">
                          <Info className="h-3.5 w-3.5 text-blue-500 mr-1.5 mt-0.5 flex-shrink-0" />
                          <p>{score.comment}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
