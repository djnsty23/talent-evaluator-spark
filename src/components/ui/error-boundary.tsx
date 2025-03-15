
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorPage from './error-page';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorPage
          title="Something went wrong"
          message={this.state.error?.message || "An unexpected error occurred"}
          showHomeButton={true}
          showRefreshButton={true}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
