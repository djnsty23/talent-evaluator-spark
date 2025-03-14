
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Job, Candidate } from '@/contexts/JobContext';
import { ArrowLeft, Search, Filter, FileText } from 'lucide-react';
import CandidateCard from '@/components/CandidateCard';

const CandidateAnalysis = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, isLoading, processCandidate, starCandidate, deleteCandidate } = useJob();
  const [job, setJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingCandidateId, setProcessingCandidateId] = useState<string | null>(null);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [filter, setFilter] = useState<'all' | 'starred' | 'processed' | 'unprocessed'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (jobId && jobs) {
      const foundJob = jobs.find(j => j.id === jobId);
      if (foundJob) {
        setJob(foundJob);
      } else {
        // Job not found, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [jobId, jobs, navigate]);

  useEffect(() => {
    if (job) {
      let candidates = [...job.candidates];
      
      // Apply filter
      if (filter === 'starred') {
        candidates = candidates.filter(c => c.isStarred);
      } else if (filter === 'processed') {
        candidates = candidates.filter(c => c.scores.length > 0);
      } else if (filter === 'unprocessed') {
        candidates = candidates.filter(c => c.scores.length === 0);
      }
      
      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        candidates = candidates.filter(c => 
          c.name.toLowerCase().includes(query) ||
          c.strengths.some(s => s.toLowerCase().includes(query)) ||
          c.weaknesses.some(w => w.toLowerCase().includes(query))
        );
      }
      
      setFilteredCandidates(candidates);
    }
  }, [job, searchQuery, filter]);

  const handleProcessCandidate = async (candidateId: string) => {
    if (!jobId) return;
    
    setProcessingCandidateId(candidateId);
    try {
      await processCandidate(jobId, candidateId);
    } catch (error) {
      console.error('Process error:', error);
    } finally {
      setProcessingCandidateId(null);
    }
  };

  const handleStarCandidate = async (candidateId: string, isStarred: boolean) => {
    if (!jobId) return;
    
    try {
      await starCandidate(jobId, candidateId, isStarred);
    } catch (error) {
      console.error('Star error:', error);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!jobId) return;
    
    try {
      await deleteCandidate(jobId, candidateId);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'starred' | 'processed' | 'unprocessed') => {
    setFilter(newFilter);
  };

  if (isLoading || !job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="h-12 bg-muted rounded w-2/3 mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        asChild 
        className="mb-6"
      >
        <Link to={`/jobs/${jobId}`} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Job Details
        </Link>
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Candidate Analysis</h1>
          <p className="text-muted-foreground mt-1">
            {job.title} at {job.company}
          </p>
        </div>
        
        <Button 
          onClick={() => navigate(`/jobs/${jobId}/report`)}
          className="mt-4 md:mt-0"
          disabled={job.candidates.length === 0}
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>
      
      {job.candidates.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12">
          <div className="text-muted-foreground mb-4">
            <FileText className="h-16 w-16" />
          </div>
          <h2 className="text-xl font-medium mb-2">No candidates found</h2>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            You haven't uploaded any candidates for this job yet. Upload candidate resumes to see the analysis.
          </p>
          <Button 
            onClick={() => navigate(`/jobs/${jobId}/upload`)}
          >
            Upload Candidates
          </Button>
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex overflow-x-auto gap-2 pb-1">
              <Badge
                variant={filter === 'all' ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1 h-9"
                onClick={() => handleFilterChange('all')}
              >
                All ({job.candidates.length})
              </Badge>
              <Badge
                variant={filter === 'starred' ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1 h-9"
                onClick={() => handleFilterChange('starred')}
              >
                Starred ({job.candidates.filter(c => c.isStarred).length})
              </Badge>
              <Badge
                variant={filter === 'processed' ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1 h-9"
                onClick={() => handleFilterChange('processed')}
              >
                Processed ({job.candidates.filter(c => c.scores.length > 0).length})
              </Badge>
              <Badge
                variant={filter === 'unprocessed' ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1 h-9"
                onClick={() => handleFilterChange('unprocessed')}
              >
                Unprocessed ({job.candidates.filter(c => c.scores.length === 0).length})
              </Badge>
            </div>
          </div>
          
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No candidates match your filter</h3>
              <p className="text-muted-foreground">
                Try changing your search query or filter criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCandidates.map(candidate => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  requirements={job.requirements}
                  onStar={(isStarred) => handleStarCandidate(candidate.id, isStarred)}
                  onProcess={() => handleProcessCandidate(candidate.id)}
                  onDelete={() => handleDeleteCandidate(candidate.id)}
                  isProcessing={processingCandidateId === candidate.id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CandidateAnalysis;
