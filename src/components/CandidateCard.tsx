
import { useState } from 'react';
import { Star, ChevronDown, ChevronUp, User, FileText, ExternalLink, Zap, Users, Award } from 'lucide-react';
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
}

const CandidateCard = ({
  candidate,
  requirements,
  onStar,
  onProcess,
  onDelete,
  onViewDetails,
  isProcessing = false,
}: CandidateCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

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
    <Card className={`w-full overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg ${expanded ? 'shadow-md' : 'shadow-sm'}`}>
      <CardHeader className="p-4 pb-2" onClick={toggleExpanded}>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-400" />
            <CardTitle className="text-lg font-medium">{candidate.name}</CardTitle>
            {candidate.isStarred && (
              <Badge variant="outline" className="text-yellow-500 border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30">
                Starred
              </Badge>
            )}
            {candidate.zodiacSign && isProcessed && (
              <Badge variant="outline" className="text-purple-500 border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/30">
                {candidate.zodiacSign}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isProcessed && (
              <div className="flex items-center space-x-1 mr-2">
                <span className={`text-xl font-semibold ${getOverallScoreColor()}`}>
                  {candidate.overallScore.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">/10</span>
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
              onClick={(e) => {
                e.stopPropagation();
                handleStarClick();
              }}
            >
              <Star className="h-5 w-5" fill={candidate.isStarred ? 'currentColor' : 'none'} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2" onClick={toggleExpanded}>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <FileText className="h-4 w-4 mr-1" />
          {isProcessed ? (
            <span>Processed on {formatDate(candidate.processedAt)}</span>
          ) : (
            <span>Resume uploaded, not yet processed</span>
          )}
        </div>

        {isProcessed && onViewDetails && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full mb-4"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            <User className="h-4 w-4 mr-2" />
            View Detailed Analysis
          </Button>
        )}

        {isProcessed && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Strengths</h4>
                <ul className="text-sm">
                  {candidate.strengths.length > 0 ? (
                    candidate.strengths.slice(0, 2).map((strength, index) => (
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
                  {candidate.strengths.length > 2 && (
                    <li className="text-xs text-blue-500 cursor-pointer">
                      +{candidate.strengths.length - 2} more...
                    </li>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Areas for Development</h4>
                <ul className="text-sm">
                  {candidate.weaknesses.length > 0 ? (
                    candidate.weaknesses.slice(0, 2).map((weakness, index) => (
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
                  {candidate.weaknesses.length > 2 && (
                    <li className="text-xs text-blue-500 cursor-pointer">
                      +{candidate.weaknesses.length - 2} more...
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Personality Traits Section */}
            {candidate.personalityTraits && candidate.personalityTraits.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Personality Traits</h4>
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
            {candidate.workStyle && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Work Style</h4>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm">{candidate.workStyle}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Additional Metrics</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 text-indigo-500 mr-1" />
                        <span className="text-xs">Culture Fit:</span>
                      </div>
                      <span className="text-xs font-medium">{candidate.cultureFit?.toFixed(1)}/10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className="h-3 w-3 text-amber-500 mr-1" />
                        <span className="text-xs">Leadership:</span>
                      </div>
                      <span className="text-xs font-medium">{candidate.leadershipPotential?.toFixed(1)}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {expanded && isProcessed && (
          <div className="mt-4 border-t pt-4 animate-fade-in">
            <h4 className="text-sm font-medium mb-3">Skill Assessment</h4>
            <div className="space-y-3">
              {candidate.scores.map((score, index) => {
                const requirement = requirements.find(req => req.id === score.requirementId);
                if (!requirement) return null;
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {requirement.description} 
                        {requirement.isRequired && (
                          <span className="text-xs text-red-500 ml-1">*</span>
                        )}
                      </span>
                      <span className="text-sm font-medium">{score.score}/10</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getScoreLevelClass(score.score)} transition-all duration-500`}
                        style={{ width: `${score.score * 10}%` }}
                      />
                    </div>
                    {score.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{score.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
            
            {candidate.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <h4 className="text-sm font-medium mb-2">Notes</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{candidate.notes}</p>
              </div>
            )}
          </div>
        )}
        
        {candidate.resumeUrl && (
          <div className={`mt-4 ${expanded ? 'border-t pt-4' : ''}`}>
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
      
      <CardFooter className="p-3 flex justify-between items-center bg-muted/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpanded();
          }}
          className="text-xs"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show More
            </>
          )}
        </Button>
        
        <div className="flex space-x-2">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="text-xs h-8"
            >
              Details
            </Button>
          )}
        
          {!isProcessed && (
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onProcess();
              }}
              disabled={isProcessing}
              className="text-xs h-8"
            >
              {isProcessing ? 'Processing...' : 'Process CV'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CandidateCard;
