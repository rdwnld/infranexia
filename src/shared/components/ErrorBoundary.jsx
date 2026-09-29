import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-8">
          <div className="max-w-md w-full mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Terjadi Kesalahan
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Aplikasi mengalami kesalahan. Silakan refresh halaman atau hubungi admin.
            </p>
            <details className="text-left mb-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs overflow-auto max-h-64">
              <summary className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer mb-2">
                Detail Error (klik untuk buka)
              </summary>
              <pre className="text-rose-600 dark:text-rose-400 whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-1" /> Refresh Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;