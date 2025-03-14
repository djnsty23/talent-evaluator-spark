
import { Job, Candidate } from '@/types/job.types';
import { format } from 'date-fns';

export const exportReportToCSV = (job: Job, candidateIds: string[]) => {
  // Get the candidates included in the report
  const candidates = job.candidates.filter(c => candidateIds.includes(c.id));
  
  // Create CSV header row with requirement descriptions
  let csvContent = "Candidate Name,";
  job.requirements.forEach(req => {
    csvContent += `"${req.description}",`;
  });
  csvContent += "Overall Score\n";
  
  // Add candidate data rows
  candidates.forEach(candidate => {
    csvContent += `"${candidate.name}",`;
    
    // Add scores for each requirement
    job.requirements.forEach(req => {
      const score = candidate.scores.find(s => s.requirementId === req.id);
      csvContent += `${score ? score.score : "N/A"},`;
    });
    
    // Add overall score
    csvContent += `${candidate.overallScore}\n`;
  });
  
  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${job.title}_Candidate_Scores_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
