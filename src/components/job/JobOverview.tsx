
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, User, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { Job } from '@/types/job.types';
import OpenAIKeyInput from '@/components/OpenAIKeyInput';

interface JobOverviewProps {
  job: Job;
  isGenerating: boolean;
  handleGenerateRequirements: () => void;
  handleAnalyzeCandidate: (candidateId: string) => void;
}

const JobOverview = ({
  job,
  isGenerating,
  handleGenerateRequirements,
  handleAnalyzeCandidate
}: JobOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Description</CardTitle>
        </CardHeader>
        <CardContent>
          {job.description ? (
            <p className="whitespace-pre-line">{job.description}</p>
          ) : (
            <p className="text-muted-foreground">No description provided</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          {job.requirements.length > 0 ? (
            <ul className="space-y-2">
              {job.requirements
                .slice(0, 10)
                .map(requirement => (
                  <li key={requirement.id} className="flex items-start">
                    <div className="w-1 h-1 rounded-full bg-primary mt-2 mr-2"></div>
                    <span>{requirement.description}</span>
                  </li>
                ))}
              {job.requirements.length > 10 && (
                <li className="text-sm text-muted-foreground">
                  + {job.requirements.length - 10} more requirements
                </li>
              )}
            </ul>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No requirements defined yet</p>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateRequirements}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    const element = document.querySelector('[data-value="requirements"]');
                    if (element) (element as HTMLElement).click();
                  }}
                  className="w-full"
                >
                  View Requirements
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="mt-2">
                <OpenAIKeyInput />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          {job.candidates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {job.candidates.slice(0, 6).map(candidate => (
                <Card key={candidate.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium truncate">{candidate.name}</h3>
                      {candidate.isStarred && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-4">
                      Score: {candidate.overallScore}/10
                    </div>
                    
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleAnalyzeCandidate(candidate.id)}
                    >
                      <User className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No candidates uploaded yet</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-4 w-full"
                onClick={() => {
                  const element = document.querySelector('[data-value="candidates"]');
                  if (element) (element as HTMLElement).click();
                }}
              >
                View Candidates
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobOverview;
