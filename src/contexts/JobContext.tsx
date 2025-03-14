
// This function specifically handles the candidate file uploads to extract proper names
const uploadCandidateFiles = useCallback(async (jobId: string, files: File[]): Promise<void> => {
  if (!jobId || files.length === 0) return;
  
  setIsLoading(true);
  
  try {
    // Find the job to update
    const job = jobs.find(j => j.id === jobId);
    if (!job) throw new Error('Job not found');
    
    // Process each file and create a candidate entry
    const newCandidates: Candidate[] = files.map((file, index) => {
      // Extract candidate name from filename (remove extension)
      const fileName = file.name;
      let candidateName = fileName.split('.').slice(0, -1).join('.');
      
      // Format the name more professionally
      candidateName = candidateName
        // Replace underscores and hyphens with spaces
        .replace(/[_-]/g, ' ')
        // Convert to title case (capitalize first letter of each word)
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())
        // Remove any prefix like "CV_" or "Resume_"
        .replace(/^(cv|resume|résumé)[\s_-]*/i, '')
        .trim();
      
      // If name is still empty after processing, use a generic name
      if (!candidateName) {
        candidateName = `Candidate ${job.candidates.length + index + 1}`;
      }
      
      return {
        id: `candidate_${Date.now()}_${index}`,
        name: candidateName,
        email: `candidate${job.candidates.length + index + 1}@example.com`,
        resumeUrl: URL.createObjectURL(file),
        overallScore: 0,
        scores: [],
        strengths: [],
        weaknesses: [],
        isStarred: false,
        status: 'pending',
        jobId: jobId,
        processedAt: new Date().toISOString(),
        personalityTraits: [],
        zodiacSign: '',
        workStyle: '',
        cultureFit: 0,
        leadershipPotential: 0
      };
    });
    
    const updatedJob = {
      ...job,
      candidates: [...job.candidates, ...newCandidates],
      updatedAt: new Date().toISOString()
    };
    
    // Update backend (mocked)
    await mockSaveData(updatedJob);
    
    // Update local state
    setJobs(prevJobs => 
      prevJobs.map(j => j.id === jobId ? updatedJob : j)
    );
    
    if (currentJob && currentJob.id === jobId) {
      setCurrentJob(updatedJob);
    }
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error uploading candidates';
    setError(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setIsLoading(false);
  }
}, [jobs, currentJob]);
