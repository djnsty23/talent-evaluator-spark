
import React, { useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Loader2, FileText } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import { extractTextFromFile } from '@/services/api';
import { toast } from 'sonner';

interface ContextFilesUploaderProps {
  contextFiles: File[];
  setContextFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setExtractedContexts: React.Dispatch<React.SetStateAction<string[]>>;
}

const ContextFilesUploader = ({ 
  contextFiles, 
  setContextFiles, 
  setExtractedContexts 
}: ContextFilesUploaderProps) => {
  const [isExtractingContext, setIsExtractingContext] = useState(false);

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
  
  const handleRemoveContextFile = (index: number) => {
    const newFiles = [...contextFiles];
    newFiles.splice(index, 1);
    setContextFiles(newFiles);
    
    setExtractedContexts(prev => {
      const newContexts = [...prev];
      newContexts.splice(index, 1);
      return newContexts;
    });
  };

  return (
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
          selectedFiles={contextFiles}
          onFileRemove={handleRemoveContextFile}
        />
        
        {isExtractingContext && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Extracting content from files...</span>
          </div>
        )}
      </div>
    </CardContent>
  );
};

export default ContextFilesUploader;
