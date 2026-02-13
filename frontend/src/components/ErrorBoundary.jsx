import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console or error reporting service
        console.error('Error Boundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // You can also log the error to an error reporting service here
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-red-100 rounded-full p-3">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Oops! Something went wrong
                            </h2>

                            <p className="text-gray-600 mb-6">
                                We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
                            </p>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="mb-6 text-left">
                                    <details className="bg-gray-50 rounded p-4">
                                        <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                                            Error Details
                                        </summary>
                                        <div className="text-xs text-red-600 font-mono overflow-auto max-h-48">
                                            <p className="font-bold">{this.state.error.toString()}</p>
                                            <pre className="mt-2 whitespace-pre-wrap">
                                                {this.state.errorInfo?.componentStack}
                                            </pre>
                                        </div>
                                    </details>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={this.handleReset}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Refresh Page
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
