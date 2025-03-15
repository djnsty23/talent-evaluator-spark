
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '@/contexts/job/JobContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, AlertCircle, Check, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import FileUploader from '@/components/FileUploader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

const CandidateUpload = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, uploadCandidateFiles } = useJob();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  
  // Find job on component mount
  useEffect(() => {
    if (jobId) {
      const foundJob = jobs.find(j => j.id === jobId);
      if (foundJob) {
        setJob(foundJob);
      } else {
        // Redirect to dashboard if job not found
        navigate('/dashboard');
      }
    }
  }, [jobId, jobs, navigate]);
  
  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };
  
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    
    if (files.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }
    
    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadMessage('');
    
    // Create a mock progress indicator
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const nextProgress = prev + 5;
        return nextProgress > 90 ? 90 : nextProgress;
      });
    }, 300);
    
    try {
      if (!jobId) {
        throw new Error('Job ID is missing');
      }
      
      await uploadCandidateFiles(jobId, files);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      setUploadMessage(`Successfully uploaded ${files.length} candidate file(s)`);
      
      // Clear the files list
      setFiles([]);
      
      // Redirect to analysis page after short delay
      setTimeout(() => {
        navigate(`/jobs/${jobId}/analysis`);
      }, 2000);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadStatus('error');
      setUploadMessage('Failed to upload files. Please try again.');
      console.error('Upload error:', error);
    }
  };
  
  if (!job) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }
  
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
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Upload Candidates for {job.title}</CardTitle>
          <CardDescription>
            Upload candidate resumes to automatically process and analyze them
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {uploadStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{uploadMessage}</AlertDescription>
            </Alert>
          )}
          
          {uploadStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{uploadMessage}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Upload candidate resumes and documents</h3>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" type="button">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The system will attempt to extract candidate names from the resume filename
                    or content. If extraction fails, "N/A" will be used.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <FileUploader 
              onFilesSelected={handleFilesSelected}
              accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
              multiple={true}
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: PDF, Word documents, text files, CSV and Excel spreadsheets
            </p>
          
            {files.length > 0 && uploadStatus === 'idle' && (
              <Button type="submit" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length} File{files.length !== 1 ? 's' : ''}
              </Button>
            )}
            
            {uploadStatus === 'uploading' && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-center">
                  Uploading files ({uploadProgress}%)...
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateUpload;
