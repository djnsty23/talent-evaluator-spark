
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Briefcase, Building, FileText, Loader2, PlusCircle, Upload } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const CreateJob = () => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [newJob, setNewJob] = useState<any>(null);
  
  const { createJob, generateRequirements, updateJob } = useJob();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !company) {
      setError('Please provide both a job title and company name.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      // First create the job
      const newJob = await createJob({
        title,
        company,
        description,
        contextFiles: contextFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
        })),
      });

      setNewJob(newJob);
      toast.success('Job created successfully');
      setActiveTab('context');
      
    } catch (err) {
      console.error('Error creating job:', err);
      setError('Failed to create job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContextFilesUpload = async (files: File[]) => {
    setContextFiles(files);
    toast.success(`${files.length} context file(s) uploaded`);
  };

  const handleGenerateRequirements = async () => {
    if (!newJob) {
      setError('Please create a job first.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Process context files and generate requirements
      const requirements = await generateRequirements({
        title,
        company,
        description,
        contextFiles: contextFiles.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
        })),
      });
      
      // Update the job with the generated requirements
      await updateJob({
        ...newJob,
        requirements,
      });
      
      // Navigate to the job detail page
      navigate(`/jobs/${newJob.id}`);
    } catch (err) {
      console.error('Error generating requirements:', err);
      setError('Failed to generate requirements. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={handleCancel} 
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Job</CardTitle>
          <CardDescription>
            Fill in job details, add context files, and generate requirements
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Job Details</TabsTrigger>
            <TabsTrigger value="context" disabled={!newJob}>Context Files</TabsTrigger>
            <TabsTrigger value="requirements" disabled={!newJob}>Requirements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium">
                    Job Title <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Software Engineer, Marketing Manager"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="company" className="block text-sm font-medium">
                    Company Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Acme Inc."
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium">
                    Job Description
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter a detailed job description to help our AI generate better requirements..."
                      className="pl-10 min-h-[120px]"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A detailed description helps our AI generate more accurate job requirements.
                  </p>
                </div>
                
                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Job & Continue'
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="context">
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Upload Context Files</h3>
                <p className="text-sm text-muted-foreground">
                  Upload files that provide context about the job requirements, such as previous job postings,
                  hiring criteria, or industry standards.
                </p>
                
                <FileUploader 
                  onFilesSelected={handleContextFilesUpload}
                  accept=".pdf,.doc,.docx,.txt,.csv"
                  multiple={true}
                />
              </div>
              
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('details')}
              >
                Back
              </Button>
              
              <Button 
                onClick={() => setActiveTab('requirements')}
                disabled={isSubmitting}
              >
                Continue
              </Button>
            </CardFooter>
          </TabsContent>
          
          <TabsContent value="requirements">
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Generate Requirements</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI will analyze your job details and context files to generate a set of
                  requirements for this position.
                </p>
                
                <div className="bg-secondary/50 p-4 rounded-md flex items-center gap-3">
                  <PlusCircle className="h-6 w-6 text-primary" />
                  <div>
                    <h4 className="font-medium text-sm">Ready to generate requirements</h4>
                    <p className="text-xs text-muted-foreground">
                      Click the button below to generate requirements based on your job details
                      {contextFiles.length > 0 ? ' and context files' : ''}.
                    </p>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('context')}
                disabled={isSubmitting}
              >
                Back
              </Button>
              
              <Button 
                onClick={handleGenerateRequirements}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Requirements'
                )}
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default CreateJob;
