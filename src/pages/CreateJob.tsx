
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Briefcase, Building, FileText, Loader2 } from 'lucide-react';

const CreateJob = () => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { createJob, generateRequirements, updateJob } = useJob(); // Added updateJob here
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
      });
      
      // Then generate requirements
      const requirements = await generateRequirements({
        title,
        company,
        description,
      });
      
      // Update the job with the generated requirements
      await updateJob({
        ...newJob,
        requirements,
      });
      
      // Navigate to the job detail page
      navigate(`/jobs/${newJob.id}`);
    } catch (err) {
      console.error('Error creating job:', err);
      setError('Failed to create job. Please try again.');
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
            Enter the job details below to create a new job listing and generate requirements
          </CardDescription>
        </CardHeader>
        
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
                'Create Job & Generate Requirements'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateJob;
