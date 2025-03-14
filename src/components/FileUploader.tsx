
import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { Upload, File, X, Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
}

const FileUploader = ({
  onFilesSelected,
  accept = '.pdf,.doc,.docx,.txt,.csv,.xlsx',
  multiple = true,
  maxFiles = 50,
  maxSizeMB = 10,
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    validateAndAddFiles(files);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      validateAndAddFiles(files);
    }
  };

  const validateAndAddFiles = (files: File[]) => {
    // Additional validation for file types
    const acceptedTypes = accept.split(',').map(type => type.trim().toLowerCase());
    
    // First filter by accepted file extensions
    const filteredFiles = files.filter(file => {
      const fileName = file.name.toLowerCase();
      const fileExtension = '.' + fileName.split('.').pop();
      
      // Check if the file extension is in the accepted types
      const isAcceptedType = acceptedTypes.some(type => {
        return fileExtension === type;
      });
      
      if (!isAcceptedType) {
        toast.error(`File "${file.name}" has an unsupported format`);
        return false;
      }
      return true;
    });
    
    // Check if adding these files would exceed max files count
    if (multiple && (selectedFiles.length + filteredFiles.length > maxFiles)) {
      toast.error(`You can only upload a maximum of ${maxFiles} files`);
      return;
    }

    // Filter out files that exceed the max size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const validFiles = filteredFiles.filter(file => {
      if (file.size > maxSizeBytes) {
        toast.error(`File "${file.name}" exceeds the ${maxSizeMB}MB size limit`);
        return false;
      }
      return true;
    });

    if (!multiple && validFiles.length > 0) {
      setSelectedFiles([validFiles[0]]);
    } else {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Invoke the callback with the selected files
      onFilesSelected(selectedFiles);
      
      setUploadProgress(100);
      toast.success(`${selectedFiles.length} file(s) uploaded successfully`);
      
      // Clear selected files after successful upload
      setSelectedFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Get file extension
  const getFileExtension = (filename: string) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  };

  // Get file icon based on extension
  const getFileIcon = (filename: string) => {
    const extension = getFileExtension(filename).toLowerCase();
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center py-4">
          <Upload 
            className={`w-12 h-12 mb-3 ${
              isDragging ? 'text-primary animate-pulse' : 'text-gray-400'
            }`} 
          />
          <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {accept.split(',').join(', ')} (Max: {maxSizeMB}MB)
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <File className="mr-2 h-4 w-4" />
            Select Files
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={handleFileInputChange}
            disabled={isUploading}
          />
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Selected Files ({selectedFiles.length})</h4>
          <div className="overflow-y-auto max-h-60 rounded-md border border-gray-200 dark:border-gray-800">
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-900/20">
                  <div className="flex items-center">
                    {getFileIcon(file.name)}
                    <div className="ml-2">
                      <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                    className="ml-2 h-8 w-8 text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {isUploading ? (
            <div className="mt-4">
              <Progress value={uploadProgress} className="h-1" />
              <p className="text-xs text-center mt-1 text-gray-600">
                Uploading... {uploadProgress}%
              </p>
            </div>
          ) : (
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedFiles([])}
                size="sm"
              >
                Clear All
              </Button>
              <Button 
                variant="default"
                onClick={handleUpload}
                size="sm"
                className="gap-1"
              >
                <Check className="h-4 w-4" />
                Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
