
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Save, Trash2, Loader2, Sparkles, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { JobRequirement } from '@/contexts/JobContext';
import { AIService } from '@/services/api';
import OpenAIKeyInput from '@/components/OpenAIKeyInput';
import FileUploader from '@/components/FileUploader';
import { extractTextFromFile } from '@/services/api';

const JobRequirementsEditor = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, updateJob } = useJob();
  const navigate = useNavigate();
  
  const job = jobs.find(j => j.id === jobId);
  
  const [requirements, setRequirements] = useState<JobRequirement[]>(
    job?.requirements || []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [extractedContexts, setExtractedContexts] = useState<string[]>([]);
  const [isExtractingContext, setIsExtractingContext] = useState(false);
  const [showContextUploader, setShowContextUploader] = useState(false);
  
  if (!job) {
    navigate('/dashboard');
    return null;
  }
  
  const handleAddRequirement = () => {
    const newRequirement: JobRequirement = {
      id: `req_${Date.now()}_${requirements.length}`,
      category: 'Technical Skills',
      description: '',
      weight: 7,
      isRequired: true,
    };
    
    setRequirements([...requirements, newRequirement]);
  };
  
  const handleRemoveRequirement = (id: string) => {
    setRequirements(requirements.filter(req => req.id !== id));
  };
  
  const handleRequirementChange = (id: string, field: keyof JobRequirement, value: any) => {
    setRequirements(requirements.map(req => 
      req.id === id ? { ...req, [field]: value } : req
    ));
  };
  
  const handleContextFilesSelected = async (files: File[]) => {
    setContextFiles(files);
    
    if (files.length > 0) {
      setIsExtractingContext(true);
      
      try {
        const extractedTexts = await Promise.all(
          files.map(file => extractTextFromFile(file))
        );
        
        setExtractedContexts(extractedTexts);
        toast.success(`Successfully extracted content from ${files.length} file(s)`);
      } catch (error) {
        console.error('Error extracting text from files:', error);
        toast.error('Failed to extract text from some files');
      } finally {
        setIsExtractingContext(false);
      }
    } else {
      setExtractedContexts([]);
    }
  };
  
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
      
      // If we already have requirements, confirm before replacing
      if (requirements.length > 0) {
        const confirmed = window.confirm(
          'This will replace your existing requirements. Continue?'
        );
        
        if (!confirmed) {
          setIsGenerating(false);
          return;
        }
      }
      
      setRequirements(result.requirements);
      toast.success('Requirements generated successfully');
    } catch (error) {
      console.error('Error generating requirements:', error);
      toast.error('Failed to generate requirements');
    } finally {
      setIsGenerating(false);
    }
  };
  
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
        <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
          <div>
            <CardTitle className="text-xl">Requirements for {job.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {requirements.length > 0 
                ? `${requirements.length} requirements defined` 
                : 'No requirements defined yet'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <OpenAIKeyInput />
            
            <Button 
              variant="outline"
              onClick={() => setShowContextUploader(!showContextUploader)}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {showContextUploader ? 'Hide Files' : 'Add Context Files'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleGenerateRequirements}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleAddRequirement}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Requirement
            </Button>
          </div>
        </CardHeader>
        
        {showContextUploader && (
          <CardContent className="border-t pt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium mb-2">Upload Context Files</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload any company documents, job descriptions, or team information to help the AI better understand the role.
                These files will be used as additional context (20% weight) for generating requirements.
              </p>
              
              <FileUploader 
                onFilesSelected={handleContextFilesSelected}
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                multiple={true}
              />
              
              {isExtractingContext && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Extracting content from files...</span>
                </div>
              )}
              
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
            </div>
          </CardContent>
        )}
        
        <CardContent>
          <div className="space-y-6">
            {requirements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border rounded-md bg-muted/10">
                <p className="text-lg mb-2">No requirements yet</p>
                <p className="text-sm max-w-md mx-auto">
                  Click 'Add Requirement' to create one manually 
                  or use 'Generate with AI' to create them automatically from the job description.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-12 gap-4 p-3 font-medium text-sm border-b">
                  <div className="col-span-3">Category</div>
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Weight (1-10)</div>
                  <div className="col-span-1 text-center">Required</div>
                  <div className="col-span-1"></div>
                </div>
                
                {requirements.map((req, index) => (
                  <div key={req.id} className="grid grid-cols-12 gap-4 p-4 border rounded-md hover:bg-muted/5 transition-colors">
                    <div className="col-span-3">
                      <Select
                        value={req.category}
                        onValueChange={(value) => handleRequirementChange(req.id, 'category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technical Skills">Technical Skills</SelectItem>
                          <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Experience">Experience</SelectItem>
                          <SelectItem value="Certifications">Certifications</SelectItem>
                          <SelectItem value="Language">Language</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-5">
                      <Textarea
                        value={req.description}
                        onChange={(e) => handleRequirementChange(req.id, 'description', e.target.value)}
                        placeholder="Requirement description"
                        className="min-h-[60px] resize-none"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Select
                        value={req.weight.toString()}
                        onValueChange={(value) => handleRequirementChange(req.id, 'weight', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Weight" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                            <SelectItem key={value} value={value.toString()}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-1 flex items-center justify-center">
                      <Switch
                        checked={req.isRequired}
                        onCheckedChange={(checked) => handleRequirementChange(req.id, 'isRequired', checked)}
                        id={`required-${req.id}`}
                      />
                    </div>
                    
                    <div className="col-span-1 flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRequirement(req.id)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end space-x-4 mt-8">
              <Button
                variant="outline"
                onClick={() => navigate(`/jobs/${jobId}`)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Requirements
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobRequirementsEditor;
