
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Save, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { JobRequirement } from '@/contexts/JobContext';

const JobRequirementsEditor = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, updateJob } = useJob();
  const navigate = useNavigate();
  
  const job = jobs.find(j => j.id === jobId);
  
  const [requirements, setRequirements] = useState<JobRequirement[]>(
    job?.requirements || []
  );
  const [isSaving, setIsSaving] = useState(false);
  
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
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/jobs/${jobId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job
        </Button>
        
        <h1 className="text-2xl font-bold">Edit Job Requirements</h1>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Requirements for {job.title}</CardTitle>
          <Button onClick={handleAddRequirement}>
            <Plus className="h-4 w-4 mr-2" />
            Add Requirement
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {requirements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No requirements yet. Click 'Add Requirement' to create one.
              </div>
            ) : (
              requirements.map((req, index) => (
                <div key={req.id} className="grid grid-cols-12 gap-4 p-4 border rounded-md">
                  <div className="col-span-3">
                    <label className="text-sm font-medium mb-1 block">Category</label>
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
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Input
                      value={req.description}
                      onChange={(e) => handleRequirementChange(req.id, 'description', e.target.value)}
                      placeholder="Requirement description"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1 block">Weight (1-10)</label>
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
                  
                  <div className="col-span-1 flex items-end">
                    <div className="flex items-center space-x-2 h-10">
                      <Switch
                        checked={req.isRequired}
                        onCheckedChange={(checked) => handleRequirementChange(req.id, 'isRequired', checked)}
                        id={`required-${req.id}`}
                      />
                      <label htmlFor={`required-${req.id}`} className="text-sm">
                        Required
                      </label>
                    </div>
                  </div>
                  
                  <div className="col-span-1 flex items-end justify-end">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveRequirement(req.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
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
