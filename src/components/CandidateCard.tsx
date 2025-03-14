
import { useState, useEffect } from 'react';
import { Star, FileText, ExternalLink, Zap, Users, Award, Trophy, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Candidate, JobRequirement } from '@/contexts/JobContext';

interface CandidateCardProps {
  candidate: Candidate;
  requirements: JobRequirement[];
  onStar: (isStarred: boolean) => void;
  onProcess: () => void;
  onDelete: () => void;
  onViewDetails?: () => void;
  isProcessing?: boolean;
  // New prop to identify if this candidate is the top scorer for a specific requirement
  isTopScorer?: { [requirementId: string]: boolean };
  allCandidatesData?: Candidate[];
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
}: CandidateCardProps) => {
  // Always expanded by default now
  const [expanded, setExpanded] = useState(true);

  // Calculate top scorers for each requirement
  const [topScorers, setTopScorers] = useState<{ [requirementId: string]: boolean }>({});

  useEffect(() => {
    if (allCandidatesData.length > 0) {
      const bestScores: { [requirementId: string]: number } = {};
      const scorerIds: { [requirementId: string]: string } = {};
      
      // Find the highest score for each requirement across all candidates
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
      
      // Mark this candidate as top scorer for relevant requirements
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getScoreLevelClass = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-blue-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getOverallScoreColor = () => {
    if (candidate.overallScore >= 8) return 'text-green-500';
    if (candidate.overallScore >= 6) return 'text-blue-500';
    if (candidate.overallScore >= 4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleStarClick = () => {
    onStar(!candidate.isStarred);
  };

  const isProcessed = candidate.scores.length > 0;

  return (
    <Card className="w-full overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
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
      
      <CardContent className="p-4 pt-3">
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <FileText className="h-4 w-4 mr-1" />
          {isProcessed ? (
            <span>Processed on {formatDate(candidate.processedAt)}</span>
          ) : (
            <span>Resume uploaded, not yet processed</span>
          )}
        </div>

        {isProcessed && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium mb-1 flex items-center">
                <Trophy className="h-4 w-4 text-green-500 mr-1" />
                Strengths
              </h4>
              <ul className="text-sm">
                {candidate.strengths.length > 0 ? (
                  candidate.strengths.map((strength, index) => (
                    <li key={index} className="text-green-600 dark:text-green-400 flex items-start mb-1">
                      <span className="bg-green-100 dark:bg-green-950/30 rounded-full p-1 mr-1 flex-shrink-0">
                        <svg className="w-2 h-2 fill-current" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 dark:text-gray-400">No notable strengths identified</li>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1 flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                Areas for Development
              </h4>
              <ul className="text-sm">
                {candidate.weaknesses.length > 0 ? (
                  candidate.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-red-600 dark:text-red-400 flex items-start mb-1">
                      <span className="bg-red-100 dark:bg-red-950/30 rounded-full p-1 mr-1 flex-shrink-0">
                        <svg className="w-2 h-2 fill-current" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">{weakness}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 dark:text-gray-400">No notable weaknesses identified</li>
                )}
              </ul>
            </div>
          </div>
        )}
        
        {/* Personality Traits Section */}
        {isProcessed && candidate.personalityTraits && candidate.personalityTraits.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Users className="h-4 w-4 text-indigo-500 mr-1" />
              Personality Traits
            </h4>
            <div className="flex flex-wrap gap-2">
              {candidate.personalityTraits.map((trait, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Work Style and Additional Metrics */}
        {isProcessed && (
          <div className="grid grid-cols-2 gap-4 mb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
            <div>
              <h4 className="text-sm font-medium mb-1 flex items-center">
                <Zap className="h-4 w-4 text-blue-500 mr-1" />
                Culture Fit
              </h4>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${(candidate.cultureFit || 0) * 10}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Culture Alignment</span>
                <span className="font-medium">{candidate.cultureFit?.toFixed(1)}/10</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1 flex items-center">
                <Award className="h-4 w-4 text-amber-500 mr-1" />
                Leadership Potential
              </h4>
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1">
                <div 
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${(candidate.leadershipPotential || 0) * 10}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Leadership</span>
                <span className="font-medium">{candidate.leadershipPotential?.toFixed(1)}/10</span>
              </div>
            </div>
          </div>
        )}

        {isProcessed && (
          <div className="mt-2 border-t border-gray-100 dark:border-gray-800 pt-3">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <Award className="h-4 w-4 text-blue-500 mr-1" />
              Skill Assessment
            </h4>
            <div className="space-y-3">
              {candidate.scores.map((score, index) => {
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
                          <Trophy className="h-4 w-4 text-yellow-500 ml-1" title="Top score among candidates" />
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
        )}
        
        {candidate.resumeUrl && (
          <div className="mt-4 border-t pt-4 border-gray-100 dark:border-gray-800">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
              onClick={(e) => {
                e.stopPropagation();
                window.open(candidate.resumeUrl, '_blank');
              }}
            >
              <FileText className="h-3 w-3 mr-1" />
              View Resume
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-3 flex justify-between items-center bg-muted/20 border-t">
        {onViewDetails && (
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="text-xs h-8"
          >
            Detailed View
          </Button>
        )}
        
        {!isProcessed && (
          <Button
            variant="default"
            size="sm"
            onClick={onProcess}
            disabled={isProcessing}
            className="text-xs h-8"
          >
            {isProcessing ? 'Processing...' : 'Process CV'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CandidateCard;
