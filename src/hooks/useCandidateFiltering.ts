import { useState, useEffect } from 'react';
import { Job, Candidate } from '@/contexts/JobContext';

export function useCandidateFiltering(
  job: Job | null,
  candidateId: string | undefined
) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [filter, setFilter] = useState<'all' | 'starred' | 'processed' | 'unprocessed'>('all');

  useEffect(() => {
    if (job) {
      if (candidateId) {
        // If viewing a specific candidate, only show that one
        const candidate = job.candidates.find(c => c.id === candidateId);
        if (candidate) {
          setFilteredCandidates([candidate]);
        } else {
          setFilteredCandidates([]);
        }
      } else {
        // Otherwise filter all candidates
        let candidates = [...job.candidates];
        
        if (filter === 'starred') {
          candidates = candidates.filter(c => c.isStarred);
        } else if (filter === 'processed') {
          candidates = candidates.filter(c => c.scores.length > 0);
        } else if (filter === 'unprocessed') {
          candidates = candidates.filter(c => c.scores.length === 0);
        }
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          candidates = candidates.filter(c => 
            c.name.toLowerCase().includes(query) ||
            c.strengths.some(s => s.toLowerCase().includes(query)) ||
            c.weaknesses.some(w => w.toLowerCase().includes(query))
          );
        }
        
        // Sort by score
        candidates.sort((a, b) => b.overallScore - a.overallScore);
        
        setFilteredCandidates(candidates);
      }
    }
  }, [job, searchQuery, filter, candidateId]);

  return {
    searchQuery,
    setSearchQuery,
    filteredCandidates,
    filter,
    setFilter
  };
}
