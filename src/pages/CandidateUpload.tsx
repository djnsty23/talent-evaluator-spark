
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '@/contexts/JobContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, AlertCircle, Check, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import FileUploader from '@/components/FileUploader';

const CandidateUpload = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { jobs, uploadCandidateFiles } = useJob();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  
  useEffect(() => {
    if (jobId) {
      const foundJob = jobs.find(j => j.id === jobId);
      if (foundJob) {
        setJob(foundJob);
      } else {
        navigate('/dashboard');
      }
    }
  }, [jobId, jobs, navigate]);
  
  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };
  
  const handleUpload = async () => {
    setUploadStatus('uploading');
    setUploadProgress(0);
    setUploadMessage('');
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const nextProgress = prev + 10;
        return nextProgress > 90 ? 90 : nextProgress;
      });
    }, 500);
    
    try {
      await uploadCandidateFiles(jobId as string, files);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      setUploadMessage(`Successfully uploaded ${files.length} candidate file(s)`);
      
      setFiles([]);
      
      setTimeout(() => {
        navigate(`/jobs/${jobId}`);
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
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Upload candidate resumes and documents</h3>
            <FileUploader 
              onFilesSelected={handleFilesSelected}
              accept=".pdf,.doc,.docx,.txt,.csv"
              multiple={true}
            />
          </div>
          
          {files.length > 0 && uploadStatus === 'idle' && (
            <div className="pt-4">
              <Button onClick={handleUpload} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length} File{files.length !== 1 ? 's' : ''}
              </Button>
            </div>
          )}
          
          {uploadStatus === 'uploading' && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-center">
                Uploading files ({uploadProgress}%)...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateUpload;
