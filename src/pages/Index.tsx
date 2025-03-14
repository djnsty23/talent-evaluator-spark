
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Upload, FileText, BarChart, Check } from 'lucide-react';

const Index = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16 flex flex-col items-center justify-center text-center">
        <div className="mb-8 flex items-center justify-center">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          AI-Powered Talent Evaluation
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10">
          Streamline your hiring process with AI. Upload resumes, get instant analysis, and find the best candidates faster.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="font-medium">
            <Link to={currentUser ? "/dashboard" : "/login"}>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-medium">
            <Link to="/login">
              {currentUser ? "Dashboard" : "Sign In"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Upload Resumes</h3>
            <p className="text-muted-foreground">
              Upload candidate resumes in various formats. Our AI processes them automatically.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">AI Analysis</h3>
            <p className="text-muted-foreground">
              Our AI evaluates each candidate against job requirements, highlighting strengths and weaknesses.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Get Ranked Reports</h3>
            <p className="text-muted-foreground">
              Generate detailed candidate ranking reports to make informed hiring decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16 bg-muted/30 rounded-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start">
            <div className="mt-1 mr-4 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Save Time</h3>
              <p className="text-muted-foreground">
                Reduce hours spent manually reviewing resumes. Our AI does the heavy lifting.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mt-1 mr-4 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Standardize Evaluation</h3>
              <p className="text-muted-foreground">
                Apply consistent criteria across all candidates to eliminate bias.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mt-1 mr-4 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Find Better Matches</h3>
              <p className="text-muted-foreground">
                Identify candidates who truly match your job requirements using AI analysis.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="mt-1 mr-4 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Data-Driven Decisions</h3>
              <p className="text-muted-foreground">
                Make hiring decisions based on quantifiable metrics and detailed reports.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Hiring Process?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Join hundreds of recruiters who are saving time and finding better candidates with our AI-powered platform.
        </p>
        <Button asChild size="lg" className="font-medium px-8">
          <Link to={currentUser ? "/dashboard" : "/login"}>
            {currentUser ? "Go to Dashboard" : "Get Started for Free"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <FileText className="h-6 w-6 text-primary mr-2" />
            <span className="font-medium">AI Talent Evaluator</span>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AI Talent Evaluator. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
