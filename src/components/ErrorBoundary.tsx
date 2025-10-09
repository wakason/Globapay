import React, { Component, ReactNode } from 'react';
import { errorLogger, ErrorType } from '../services/errorLogging';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: { componentStack: string }): void {
        errorLogger.logError(error, ErrorType.UNKNOWN, 'ErrorBoundary', {
            componentStack: info.componentStack
        });
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h1>Something went wrong</h1>
                    <p>Please try refreshing the page or contact support if the problem persists.</p>
                </div>
            );
        }

        return this.props.children;
    }
}
