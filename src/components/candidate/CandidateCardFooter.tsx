
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { EyeIcon, ZapIcon, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface CandidateCardFooterProps {
  isProcessed: boolean;
  isProcessing: boolean;
  onProcess: () => void;
  onDelete: () => void;
  onViewDetails?: () => void;
  jobId?: string;
}

const CandidateCardFooter = ({
  isProcessed,
  isProcessing,
  onProcess,
  onDelete,
  onViewDetails,
  jobId,
}: CandidateCardFooterProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t">
      {isProcessed ? (
        <div className="flex gap-2 w-full">
          {onViewDetails ? (
            <Button 
              onClick={onViewDetails} 
              className="flex-1"
              variant="secondary"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View Details
            </Button>
          ) : (
            jobId && (
              <Button 
                variant="secondary"
                className="flex-1"
                asChild
              >
                <Link to={`/jobs/${jobId}/report`}>
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View in Report
                </Link>
              </Button>
            )
          )}
          <Button 
            variant="outline" 
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 w-full">
          <Button 
            onClick={onProcess}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <span className="animate-pulse">Processing...</span>
              </>
            ) : (
              <>
                <ZapIcon className="h-4 w-4 mr-1" />
                Process Candidate
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        title="Delete Candidate"
        description="Are you sure you want to delete this candidate? This action cannot be undone."
        onConfirm={() => {
          onDelete();
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default CandidateCardFooter;
