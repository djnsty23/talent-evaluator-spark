
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Job } from '@/contexts/JobContext';
import { ArrowLeft, Upload, FileText, AlertCircle, Check, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FileUploader } from '@/components/FileUploader';

const CandidateUpload = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, isLoading, uploadCandidateFiles } = useJob();
  const [job, setJob] = useState<Job | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
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

  const handleUpload = async () => {
    if (!jobId || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('idle');
    setUploadMessage('');
    
    // Mock upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const nextProgress = prev + 10;
        return nextProgress >= 90 ? 90 : nextProgress;
      });
    }, 500);
    
    try {
      await uploadCandidateFiles(jobId, files);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      setUploadMessage(`Successfully uploaded ${files.length} candidate file(s)`);
      
      // Clear files after successful upload
      setFiles([]);
      
      // Wait 2 seconds before navigating
      setTimeout(() => {
        navigate(`/jobs/${jobId}`);
      }, 2000);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setUploadStatus('error');
      setUploadMessage('Failed to upload files. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/jobs/${jobId}`);
  };

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    setUploadStatus('idle');
  };

  if (isLoading || !job) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <div className="h-12 bg-muted rounded w-2/3 mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
          
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
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
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            <CardTitle>Upload Candidates</CardTitle>
          </div>
          <CardDescription>
            Upload candidate resumes and additional documents for {job.title} at {job.company}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {uploadStatus === 'success' ? (
            <Alert variant="default" className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/40">
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{uploadMessage}</AlertDescription>
            </Alert>
          ) : uploadStatus === 'error' ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{uploadMessage}</AlertDescription>
            </Alert>
          ) : null}
          
          <div className="mt-4">
            <FileUploader
              maxFiles={10}
              maxSize={10}
              accept={{
                'application/pdf': ['.pdf'],
                'application/msword': ['.doc'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'text/csv': ['.csv'],
                'text/plain': ['.txt'],
              }}
              value={files}
              onChange={handleFilesChange}
              disabled={isUploading}
            />
            
            {files.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-medium">Selected Files ({files.length})</h3>
                <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border-b last:border-0">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          const newFiles = [...files];
                          newFiles.splice(index, 1);
                          handleFilesChange(newFiles);
                        }}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {isUploading && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          
          <Button 
            variant="default" 
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Candidates'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CandidateUpload;
