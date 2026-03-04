import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-black flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertTriangle size={48} className="mx-auto text-pr-yellow mb-4" />
            <h1 className="font-display text-2xl text-pr-yellow mb-2">ALGO SALIÓ MAL</h1>
            <p className="text-white/60 text-sm mb-4">
              Ocurrió un error inesperado. Intenta recargar la página.
            </p>
            {this.state.error && (
              <pre className="text-left bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white/40 mb-4 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 bg-pr-yellow text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-pr-yellow/90 transition-colors"
            >
              <RefreshCw size={16} />
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
