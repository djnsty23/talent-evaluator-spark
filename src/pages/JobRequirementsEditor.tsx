import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { JobRequirement } from '@/types/job.types';
import { AIService } from '@/services/api';
import RequirementsList from '@/components/job-requirements/RequirementsList';
import ContextFilesUploader from '@/components/job-requirements/ContextFilesUploader';
import RequirementsHeader from '@/components/job-requirements/RequirementsHeader';
import RequirementsActions from '@/components/job-requirements/RequirementsActions';
import { REQUIREMENT_CATEGORIES } from '@/components/job-requirements/JobRequirementForm';

const JobRequirementsEditor = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, updateJob } = useJob();
  const navigate = useNavigate();
  
  // Find the current job
  const job = jobs.find(j => j.id === jobId);
  
  // State management
  const [requirements, setRequirements] = useState<JobRequirement[]>(
    job?.requirements || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [extractedContexts, setExtractedContexts] = useState<string[]>([]);
  const [showContextUploader, setShowContextUploader] = useState(false);
  
  // Sync requirements with job data
  useEffect(() => {
    if (jobId && jobs.length > 0) {
      const currentJob = jobs.find(j => j.id === jobId);
      if (currentJob) {
        setRequirements(currentJob.requirements || []);
      } else {
        console.error('Job not found, redirecting to dashboard');
        navigate('/dashboard');
      }
    }
  }, [jobId, jobs, navigate]);
  
  // Show loading state if job is not found
  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Loading job data...</h3>
            <p className="text-muted-foreground">Please wait while we retrieve the job information.</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Add a new requirement
  const handleAddRequirement = () => {
    const newRequirement: JobRequirement = {
      id: uuidv4(), // Using proper UUID instead of timestamp-based ID
      category: REQUIREMENT_CATEGORIES[0], // Default to first category
      description: '',
      weight: 7,
      isRequired: true,
    };
    
    setRequirements([...requirements, newRequirement]);
  };
  
  // Remove a requirement
  const handleRemoveRequirement = (id: string) => {
    setRequirements(requirements.filter(req => req.id !== id));
  };
  
  // Update a requirement
  const handleRequirementChange = (id: string, field: keyof JobRequirement, value: any) => {
    setRequirements(requirements.map(req => 
      req.id === id ? { ...req, [field]: value } : req
    ));
  };
  
  // Generate requirements using AI
  const handleGenerateRequirements = async () => {
    if (!window.openAIKey) {
      toast.error('Please set your OpenAI API key first');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const result = await AIService.generateRequirements({
        jobInfo: {
          title: job.title,
          company: job.company,
          description: job.description,
        },
        contextFiles: extractedContexts
      });
      
      if (requirements.length > 0) {
        const confirmed = window.confirm(
          'This will replace your existing requirements. Continue?'
        );
        
        if (!confirmed) {
          setIsGenerating(false);
          return;
        }
      }
      
      // Ensure all generated requirements have proper UUIDs
      const requirementsWithUUIDs = result.requirements.map(req => ({
        ...req,
        id: uuidv4()
      }));
      
      setRequirements(requirementsWithUUIDs);
      toast.success('Requirements generated successfully');
    } catch (error) {
      console.error('Error generating requirements:', error);
      toast.error('Failed to generate requirements');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Save requirements
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const updatedJob = {
        ...job,
        requirements,
      };
      
      await updateJob(updatedJob);
      toast.success('Job requirements saved successfully');
      navigate(`/jobs/${jobId}`);
    } catch (error) {
      console.error('Error saving requirements:', error);
      toast.error('Failed to save requirements');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/jobs/${jobId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Job
        </Button>
        
        <h1 className="text-2xl font-bold">Edit Job Requirements</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-0">
          <RequirementsHeader 
            requirementsCount={requirements.length}
            isGenerating={isGenerating}
            showContextUploader={showContextUploader}
            onAddRequirement={handleAddRequirement}
            onGenerateRequirements={handleGenerateRequirements}
            onToggleContextUploader={() => setShowContextUploader(!showContextUploader)}
          />
        </CardHeader>
        
        {showContextUploader && (
          <ContextFilesUploader
            contextFiles={contextFiles}
            setContextFiles={setContextFiles}
            setExtractedContexts={setExtractedContexts}
          />
        )}
        
        <CardContent>
          <div className="space-y-6">
            <RequirementsList
              requirements={requirements}
              onRemoveRequirement={handleRemoveRequirement}
              onRequirementChange={handleRequirementChange}
            />
            
            <RequirementsActions 
              isSaving={isSaving}
              onSave={handleSave}
              onCancel={() => navigate(`/jobs/${jobId}`)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobRequirementsEditor;
