import { Candidate } from '@/types/job.types';

// Improved function to extract candidate name from resume filename
export const extractCandidateName = (fileName: string): string => {
  // Remove file extension
  let candidateName = fileName.split('.').slice(0, -1).join('.');
  
  // Replace common prefixes
  candidateName = candidateName
    .replace(/^(cv|resume|résumé|curriculum\s*vitae)[\s_-]*/i, '')
    .replace(/^(cv|resume)_/i, '')
    .trim();
  
  // Replace underscores, hyphens, and numbers with spaces
  candidateName = candidateName
    .replace(/[_-]/g, ' ')
    .replace(/\d+/g, ' ')
    .replace(/\s+/g, ' ');
  
  // Process name to ensure proper capitalization
  candidateName = candidateName
    .split(' ')
    .map(part => {
      // Skip empty parts
      if (!part) return '';
      // Capitalize first letter of each word
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .filter(Boolean) // Remove empty parts
    .join(' ');
  
  // Check if the name looks like a generic filename
  const genericFilenames = ['untitled', 'document', 'scan', 'img', 'image', 'file', 'pdf', 'doc'];
  if (genericFilenames.includes(candidateName.toLowerCase()) || candidateName.length < 3) {
    return '';
  }
  
  return candidateName || '';
};

// Helper function to generate evaluation comments
export const generateComment = (requirementDescription: string): string => {
  const positiveComments = [
    `Candidate demonstrates strong skills in ${requirementDescription.toLowerCase()}.`,
    `Excellent background in ${requirementDescription.toLowerCase()}.`,
    `Candidate's experience closely aligns with ${requirementDescription.toLowerCase()}.`
  ];
  
  const negativeComments = [
    `Candidate shows limited experience with ${requirementDescription.toLowerCase()}.`,
    `Could benefit from more training in ${requirementDescription.toLowerCase()}.`,
    `Resume lacks clear evidence of ${requirementDescription.toLowerCase()}.`
  ];
  
  const neutralComments = [
    `Candidate has some experience with ${requirementDescription.toLowerCase()}.`,
    `Moderate skills demonstrated in ${requirementDescription.toLowerCase()}.`,
    `Some background in ${requirementDescription.toLowerCase()}, but could be strengthened.`
  ];
  
  // Randomly select comment type
  const commentType = Math.floor(Math.random() * 3);
  if (commentType === 0) {
    return positiveComments[Math.floor(Math.random() * positiveComments.length)];
  } else if (commentType === 1) {
    return negativeComments[Math.floor(Math.random() * negativeComments.length)];
  } else {
    return neutralComments[Math.floor(Math.random() * neutralComments.length)];
  }
};

// Get random items from arrays
export const getRandomItems = (arr: string[], count: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to generate realistic names (instead of extracting from filenames)
export const generateRealisticName = (): string => {
  const firstNames = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", 
    "William", "Elizabeth", "David", "Susan", "Richard", "Jessica", "Joseph", "Sarah",
    "Thomas", "Karen", "Charles", "Nancy", "Christopher", "Lisa", "Daniel", "Margaret",
    "Matthew", "Betty", "Anthony", "Sandra", "Mark", "Ashley", "Donald", "Kimberly",
    "Steven", "Emily", "Paul", "Donna", "Andrew", "Michelle", "Joshua", "Carol",
    "Ana", "Carmen", "Ciprian", "Tudor", "Bogdan", "Gavrilă", "Alex", "Tomasa"
  ];
  
  const lastNames = [
    "Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson",
    "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
    "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis", "Lee",
    "Walker", "Hall", "Allen", "Young", "Hernandez", "King", "Wright", "Lopez",
    "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter",
    "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans",
    "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers", "Reed", "Cook",
    "Morgan", "Bell", "Murphy", "Bailey", "Rivera", "Cooper", "Richardson", "Cox",
    "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez", "James", "Watson",
    "Brooks", "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross",
    "Henderson", "Coleman", "Jenkins", "Perry", "Powell", "Long", "Patterson", "Hughes",
    "Flores", "Washington", "Butler", "Simmons", "Foster", "Gonzales", "Bryant", "Alexander",
    "Russell", "Griffin", "Diaz", "Hayes", "Myers", "Ford", "Hamilton", "Graham",
    "Sullivan", "Wallace", "Woods", "Cole", "West", "Jordan", "Owens", "Reynolds",
    "Fisher", "Ellis", "Harrison", "Gibson", "McDonald", "Cruz", "Marshall", "Ortiz",
    "Gomez", "Murray", "Freeman", "Wells", "Webb", "Simpson", "Stevens", "Tucker",
    "Porter", "Hunter", "Hicks", "Crawford", "Henry", "Boyd", "Mason", "Morales",
    "Kennedy", "Warren", "Dixon", "Ramos", "Reyes", "Burns", "Gordon", "Shaw",
    "Holmes", "Rice", "Robertson", "Hunt", "Black", "Daniels", "Palmer", "Mills",
    "Nichols", "Grant", "Knight", "Ferguson", "Rose", "Stone", "Hawkins", "Dunn",
    "Perkins", "Hudson", "Spencer", "Gardner", "Stephens", "Payne", "Pierce", "Berry",
    "Matthews", "Arnold", "Wagner", "Willis", "Ray", "Watkins", "Olson", "Carroll",
    "Duncan", "Snyder", "Hart", "Cunningham", "Bradley", "Lane", "Andrews", "Ruiz",
    "Harper", "Fox", "Riley", "Armstrong", "Carpenter", "Weaver", "Greene", "Lawrence",
    "Elliott", "Chavez", "Sims", "Austin", "Peters", "Kelley", "Franklin", "Lawson"
  ];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
};

// Helper function to generate mock report content
export const generateMockReportContent = (job: any, candidateIds: string[], additionalPrompt?: string): string => {
  const candidates = job.candidates.filter((c: Candidate) => candidateIds.includes(c.id));
  const sortedCandidates = [...candidates].sort((a, b) => b.overallScore - a.overallScore);
  
  let content = `# Candidate Ranking Report for ${job.title}\n\n`;
  content += `## Job Overview\n\n`;
  content += `**Title:** ${job.title}\n`;
  content += `**Company:** ${job.company}\n`;
  content += `**Department:** ${job.department}\n`;
  content += `**Location:** ${job.location}\n\n`;
  
  content += `## Job Requirements\n\n`;
  job.requirements.forEach((req: any) => {
    content += `- ${req.description} (Weight: ${req.weight}/10, ${req.isRequired ? 'Required' : 'Optional'})\n`;
  });
  
  content += `\n## Candidate Rankings\n\n`;
  sortedCandidates.forEach((candidate: Candidate, index: number) => {
    content += `### ${index + 1}. ${candidate.name} (${candidate.overallScore.toFixed(1)}/10)\n\n`;
    
    content += `**Strengths:**\n`;
    candidate.strengths.forEach(strength => {
      content += `- ${strength}\n`;
    });
    
    content += `\n**Areas for Development:**\n`;
    candidate.weaknesses.forEach(weakness => {
      content += `- ${weakness}\n`;
    });
    
    content += `\n**Skill Assessment:**\n`;
    candidate.scores.forEach(score => {
      const requirement = job.requirements.find((r: any) => r.id === score.requirementId);
      if (requirement) {
        content += `- ${requirement.description}: ${score.score}/10\n`;
      }
    });
    
    content += `\n`;
  });
  
  if (additionalPrompt) {
    content += `## Additional Analysis\n\n`;
    content += `Custom analysis based on: "${additionalPrompt}"\n\n`;
    content += `This section would contain AI-generated analysis based on the custom prompt.\n\n`;
  }
  
  content += `## Recommendations\n\n`;
  content += `Based on the analysis, we recommend proceeding with interviews for the top 3 candidates.\n`;
  
  return content;
};

// New function to try extracting name from CV content
export const extractNameFromContent = async (content: string): Promise<string> => {
  // In a real implementation, this would use NLP or AI to extract the name from the CV content
  // For now, just implement a simple heuristic
  
  // Look for common patterns of names in resumes
  const lines = content.split('\n').slice(0, 10); // Check first 10 lines
  
  for (const line of lines) {
    // A line with just 2-3 words is likely a name
    const trimmedLine = line.trim();
    const words = trimmedLine.split(/\s+/).filter(Boolean);
    
    if (words.length >= 2 && words.length <= 3 && 
        words.every(word => word.length > 1) &&
        !/\d/.test(trimmedLine) && // No numbers
        !/[@:\/]/.test(trimmedLine) && // No email or URLs
        trimmedLine.length < 30) { // Not too long
      
      return words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
  }
  
  return '';
};
