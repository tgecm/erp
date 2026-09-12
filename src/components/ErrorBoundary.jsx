import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CrossMart ERP Boundary Caught Error]:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('cm_user');
      localStorage.removeItem('cm_token');
    } catch (e) {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 select-none">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-2">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-black tracking-tight text-white">
                Application Recovered
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                An unhandled state change occurred during session transition. Click below to return to CrossMart ERP.
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-bold shadow-lg flex items-center justify-center space-x-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
