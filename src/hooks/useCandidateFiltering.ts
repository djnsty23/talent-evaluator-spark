
import { useState, useEffect } from 'react';
import { Candidate, Job } from '@/types/job.types';

export function useCandidateFiltering(
  candidatesOrJob: Candidate[] | Job | null,
  searchTerm: string
) {
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [filter, setFilter] = useState<'all' | 'starred' | 'processed' | 'unprocessed'>('all');

  useEffect(() => {
    // Handle both array of candidates or Job object
    let candidates: Candidate[] = [];
    
    if (Array.isArray(candidatesOrJob)) {
      candidates = candidatesOrJob;
    } else if (candidatesOrJob && 'candidates' in candidatesOrJob) {
      candidates = candidatesOrJob.candidates;
    }
    
    if (!candidates || candidates.length === 0) {
      setFilteredCandidates([]);
      return;
    }
    
    // First filter by the selected filter type
    let filtered = [...candidates];
    
    if (filter === 'starred') {
      filtered = filtered.filter(c => c.isStarred);
    } else if (filter === 'processed') {
      filtered = filtered.filter(c => c.scores && c.scores.length > 0);
    } else if (filter === 'unprocessed') {
      filtered = filtered.filter(c => !c.scores || c.scores.length === 0);
    }
    
    // Then apply search term filtering if present
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        (c.strengths && c.strengths.some(s => s.toLowerCase().includes(query))) ||
        (c.weaknesses && c.weaknesses.some(w => w.toLowerCase().includes(query)))
      );
    }
    
    // Sort candidates - first by starred, then by score
    filtered.sort((a, b) => {
      // Starred candidates first
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      
      // Then by overall score (highest first)
      return b.overallScore - a.overallScore;
    });
    
    setFilteredCandidates(filtered);
  }, [candidatesOrJob, searchTerm, filter]);

  return {
    searchQuery: searchTerm,
    setSearchQuery: () => {}, // This is a placeholder as the parent component manages the state
    filteredCandidates,
    filter,
    setFilter
  };
}
