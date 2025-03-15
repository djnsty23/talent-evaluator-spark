import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Job } from "@/types/job.types";
import { Building, Briefcase, MapPin, Edit, Upload, FileText, Trash2 } from "lucide-react";
import { useJob } from '@/contexts/job/JobContext';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface JobDetailHeaderProps {
  job: Job;
  handleEditRequirements: () => void;
  handleUploadCandidates: () => void;
  handleGenerateReport: () => void;
}

const JobDetailHeader = ({
  job,
  handleEditRequirements,
  handleUploadCandidates,
  handleGenerateReport,
}: JobDetailHeaderProps) => {
  const navigate = useNavigate();
  const { deleteJob } = useJob();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Clean up state when component unmounts or job changes
  useEffect(() => {
    return () => {
      if (showDeleteConfirm) {
        setShowDeleteConfirm(false);
      }
    };
  }, [job.id]); // Reset dialog when job ID changes

  const handleDelete = async () => {
    if (isDeleting) return; // Prevent multiple deletion attempts
    
    setIsDeleting(true);
    console.log(`Starting job deletion for job: ${job.id}`);
    
    try {
      await deleteJob(job.id);
      toast.success('Job deleted successfully');
      
      // Use setTimeout to ensure UI state is updated before navigation
      setTimeout(() => {
        console.log('Navigating to dashboard after job deletion');
        navigate('/dashboard');
      }, 100);
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job. Please try again later.');
      setIsDeleting(false);
      setShowDeleteConfirm(false); // Close dialog on error
    }
  };

  // Handle closing the confirm dialog
  const handleCancelDelete = () => {
    console.log('Cancelling job deletion');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold">{job.title}</h1>
          
          <div className="flex flex-wrap gap-y-2 mt-2">
            {job.company && (
              <div className="flex items-center mr-4 text-gray-600 dark:text-gray-300">
                <Building className="h-4 w-4 mr-1" />
                <span>{job.company}</span>
              </div>
            )}
            
            {job.department && (
              <div className="flex items-center mr-4 text-gray-600 dark:text-gray-300">
                <Briefcase className="h-4 w-4 mr-1" />
                <span>{job.department}</span>
              </div>
            )}
            
            {job.location && (
              <div className="flex items-center mr-4 text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{job.location}</span>
              </div>
            )}
          </div>

          {job.description && (
            <p className="mt-3 text-gray-600 dark:text-gray-300 max-w-2xl">
              {job.description}
            </p>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 md:items-start mt-2 md:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEditRequirements}
            className="flex items-center"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit Requirements
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleUploadCandidates}
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload Candidates
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateReport}
            className="flex items-center"
            disabled={job.candidates.length === 0}
          >
            <FileText className="h-4 w-4 mr-1" />
            Generate Report
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {isDeleting ? 'Deleting...' : 'Delete Job'}
          </Button>
        </div>
      </div>

      {/* Only render the dialog when showDeleteConfirm is true */}
      {showDeleteConfirm && (
        <ConfirmDialog 
          isOpen={showDeleteConfirm}
          title="Delete Job"
          description="Are you sure you want to delete this job? This will permanently remove the job and all associated candidates. This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={handleCancelDelete}
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default JobDetailHeader;
