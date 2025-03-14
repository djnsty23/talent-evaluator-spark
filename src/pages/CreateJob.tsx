
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Upload, Check } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import { toast } from 'sonner';

const CreateJob = () => {
  const navigate = useNavigate();
  const { createJob, updateJob } = useJob();
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    department: '',
    salary: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleContextFilesSelected = (files: File[]) => {
    setContextFiles(files);
  };
  
  const handleCreateJob = async () => {
    setLoading(true);
    
    try {
      // Create a new job with initial data - don't include requirements 
      // as it's already excluded in the type definition
      const newJob = await createJob({
        ...formData,
      });
      
      toast.success('Job created successfully!');
      navigate(`/jobs/${newJob.id}`);
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const isFormValid = () => {
    return formData.title && formData.company && formData.description;
  };
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Job</CardTitle>
          <CardDescription>
            Fill in the details below to create a new job posting
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Job Details</TabsTrigger>
              <TabsTrigger value="context">Context Files</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., Senior React Developer"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      placeholder="e.g., Tech Solutions Inc."
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the job role, responsibilities, and ideal candidate..."
                    rows={5}
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g., Remote, New York, etc."
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      placeholder="e.g., Engineering, Marketing, etc."
                      value={formData.department}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary Range</Label>
                    <Input
                      id="salary"
                      name="salary"
                      placeholder="e.g., $80,000 - $120,000"
                      value={formData.salary}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={() => setActiveTab('context')}
                    disabled={!isFormValid()}
                    className="w-full"
                  >
                    Continue to Context Files
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="context" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Upload Context Files</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload any relevant documents that describe the job role, company culture, 
                    team structure, or other useful information. Our AI will use these to 
                    generate more accurate job requirements.
                  </p>
                  
                  <FileUploader 
                    onFilesSelected={handleContextFilesSelected}
                    accept=".pdf,.doc,.docx,.txt"
                    multiple={true}
                  />
                </div>
                
                {contextFiles.length > 0 && (
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">Selected Files ({contextFiles.length})</h4>
                    <ul className="space-y-1">
                      {contextFiles.map((file, index) => (
                        <li key={index} className="text-sm">
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('details')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Details
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('requirements')}
                    className=""
                  >
                    Continue to Requirements
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="requirements" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Job Requirements</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Review the AI-generated job requirements below. You can edit these 
                    after creating the job.
                  </p>
                  
                  {/* Placeholder for AI-generated requirements */}
                  <div className="border rounded-md p-4 bg-muted/20">
                    <p className="text-sm text-muted-foreground italic">
                      Requirements will be generated after creating the job. You can edit them later.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('context')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Context Files
                  </Button>
                  
                  <Button 
                    onClick={handleCreateJob}
                    disabled={!isFormValid() || loading}
                  >
                    {loading ? (
                      <>Creating Job...</>
                    ) : (
                      <>
                        Create Job
                        <Check className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateJob;
