
import { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Star, FileText, Trash2 } from 'lucide-react';
import { Job } from '@/types/job.types';
import { useJob } from '@/contexts/job/JobContext';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface JobCandidatesListProps {
  job: Job;
  handleUploadCandidates: () => void;
  handleAnalyzeCandidate: (candidateId: string) => void;
}

const JobCandidatesList = ({
  job,
  handleUploadCandidates,
  handleAnalyzeCandidate
}: JobCandidatesListProps) => {
  const { deleteCandidate } = useJob();
  const [candidateToDelete, setCandidateToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteCandidate = async (candidateId: string) => {
    setIsDeleting(true);
    
    try {
      await deleteCandidate(job.id, candidateId);
      toast.success('Candidate deleted successfully');
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    } finally {
      setIsDeleting(false);
      setCandidateToDelete(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Candidates</CardTitle>
        <Button onClick={handleUploadCandidates}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Candidates
        </Button>
      </CardHeader>
      <CardContent>
        {job.candidates.length > 0 ? (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {job.candidates.map(candidate => (
                <Card key={candidate.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-lg">{candidate.name}</h3>
                        <div className="flex items-center mt-1">
                          <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Processed on {new Date(candidate.processedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {candidate.isStarred && (
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-2" />
                        )}
                        <Badge className={`${
                          candidate.overallScore >= 8 ? 'bg-green-100 text-green-800' : 
                          candidate.overallScore >= 6 ? 'bg-blue-100 text-blue-800' : 
                          candidate.overallScore >= 4 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          Score: {candidate.overallScore}/10
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Strengths</h4>
                        {candidate.strengths.length > 0 ? (
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {candidate.strengths.slice(0, 3).map((strength, index) => (
                              <li key={index} className="text-green-600">{strength}</li>
                            ))}
                            {candidate.strengths.length > 3 && (
                              <li className="text-muted-foreground">
                                +{candidate.strengths.length - 3} more
                              </li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">None identified</p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Areas for Improvement</h4>
                        {candidate.weaknesses.length > 0 ? (
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {candidate.weaknesses.slice(0, 3).map((weakness, index) => (
                              <li key={index} className="text-red-600">{weakness}</li>
                            ))}
                            {candidate.weaknesses.length > 3 && (
                              <li className="text-muted-foreground">
                                +{candidate.weaknesses.length - 3} more
                              </li>
                            )}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">None identified</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAnalyzeCandidate(candidate.id)}
                        className="flex-1"
                      >
                        View Detailed Analysis
                      </Button>
                      <Button
                        variant="outline"
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setCandidateToDelete(candidate.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No candidates uploaded yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload candidate resumes to start the evaluation process
            </p>
            <Button onClick={handleUploadCandidates}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Candidates
            </Button>
          </div>
        )}
      </CardContent>

      <ConfirmDialog 
        isOpen={!!candidateToDelete}
        title="Delete Candidate"
        description="Are you sure you want to delete this candidate? This action cannot be undone."
        onConfirm={() => candidateToDelete && handleDeleteCandidate(candidateToDelete)}
        onCancel={() => setCandidateToDelete(null)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Card>
  );
};

export default JobCandidatesList;
