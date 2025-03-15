
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Job } from '@/types/job.types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AIService } from '@/services/api';
import { toast } from 'sonner';
import JobRequirementsSummary from '@/components/JobRequirementsSummary';
import JobDetailHeader from '@/components/job/JobDetailHeader';
import JobOverview from '@/components/job/JobOverview';
import JobCandidatesList from '@/components/job/JobCandidatesList';

const JobDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, setCurrentJob, updateJob } = useJob();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<Job | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  useEffect(() => {
    if (jobId) {
      const foundJob = jobs.find(j => j.id === jobId);
      if (foundJob) {
        setJob(foundJob);
        setCurrentJob(foundJob);
      } else {
        navigate('/dashboard');
      }
    }
  }, [jobId, jobs, navigate, setCurrentJob]);
  
  const handleUploadCandidates = () => {
    navigate(`/jobs/${jobId}/upload`);
  };
  
  const handleAnalyzeCandidate = (candidateId: string) => {
    navigate(`/jobs/${jobId}/candidates/${candidateId}`);
  };
  
  const handleGenerateReport = () => {
    navigate(`/jobs/${jobId}/report`);
  };

  const handleEditRequirements = () => {
    navigate(`/jobs/${jobId}/requirements/edit`);
  };

  const handleGenerateRequirements = async () => {
    if (!window.openAIKey) {
      toast.error('Please set your OpenAI API key first');
      return;
    }

    if (!job) return;
    
    // If we already have requirements, confirm before replacing
    if (job.requirements.length > 0) {
      const confirmed = window.confirm(
        'This will replace your existing requirements. Continue?'
      );
      
      if (!confirmed) {
        return;
      }
    }
    
    setIsGenerating(true);
    
    try {
      const result = await AIService.generateRequirements({
        jobInfo: {
          title: job.title,
          company: job.company,
          description: job.description,
        }
      });
      
      const updatedJob = {
        ...job,
        requirements: result.requirements,
      };
      
      await updateJob(updatedJob);
      setJob(updatedJob);
      toast.success('Requirements generated successfully');
    } catch (error) {
      console.error('Error generating requirements:', error);
      toast.error('Failed to generate requirements');
    } finally {
      setIsGenerating(false);
    }
  };
  
  if (!job) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/dashboard')} 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <JobDetailHeader 
            job={job}
            handleEditRequirements={handleEditRequirements}
            handleUploadCandidates={handleUploadCandidates}
            handleGenerateReport={handleGenerateReport}
          />
        </div>
        
        <Tabs defaultValue="overview" className="lg:col-span-3">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="candidates">
              Candidates
              {job.candidates.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {job.candidates.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <JobOverview 
              job={job}
              isGenerating={isGenerating}
              handleGenerateRequirements={handleGenerateRequirements}
              handleAnalyzeCandidate={handleAnalyzeCandidate}
            />
          </TabsContent>
          
          <TabsContent value="requirements">
            {job && job.id && (
              <JobRequirementsSummary jobId={job.id} requirements={job.requirements} />
            )}
          </TabsContent>
          
          <TabsContent value="candidates">
            <JobCandidatesList 
              job={job}
              handleUploadCandidates={handleUploadCandidates}
              handleAnalyzeCandidate={handleAnalyzeCandidate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JobDetail;
