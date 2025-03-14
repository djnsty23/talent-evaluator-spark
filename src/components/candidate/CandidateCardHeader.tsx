
import React from 'react';
import { Star } from 'lucide-react';
import { CardTitle, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Candidate } from '@/contexts/JobContext';

interface CandidateCardHeaderProps {
  candidate: Candidate;
  onStar: (isStarred: boolean) => void;
}

const CandidateCardHeader = ({ candidate, onStar }: CandidateCardHeaderProps) => {
  const handleStarClick = () => {
    onStar(!candidate.isStarred);
  };
  
  const getOverallScoreColor = () => {
    if (candidate.overallScore >= 8) return 'text-green-500';
    if (candidate.overallScore >= 6) return 'text-blue-500';
    if (candidate.overallScore >= 4) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const isProcessed = candidate.scores.length > 0;

  return (
    <CardHeader className="p-4 pb-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg font-bold">{candidate.name}</CardTitle>
            {candidate.isStarred && (
              <Badge variant="outline" className="text-yellow-500 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30">
                Starred
              </Badge>
            )}
          </div>
          
          {isProcessed && (
            <div className="flex flex-wrap gap-2 mt-1">
              {candidate.zodiacSign && (
                <Badge variant="outline" className="text-purple-500 border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/30">
                  {candidate.zodiacSign}
                </Badge>
              )}
              {candidate.workStyle && (
                <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
                  {candidate.workStyle}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isProcessed && (
            <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-md px-3 py-1 shadow">
              <span className={`text-2xl font-bold ${getOverallScoreColor()}`}>
                {candidate.overallScore.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">Score</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-full transition-colors ${
              candidate.isStarred 
                ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:hover:bg-yellow-950/50' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
            onClick={handleStarClick}
          >
            <Star className="h-5 w-5" fill={candidate.isStarred ? 'currentColor' : 'none'} />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default CandidateCardHeader;
