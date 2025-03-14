
const CandidateAnalysisLoading = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
        <div className="h-12 bg-muted rounded w-2/3 mb-4"></div>
        <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default CandidateAnalysisLoading;
