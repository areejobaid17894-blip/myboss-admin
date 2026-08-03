import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Admin portal render error', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'Inter, sans-serif' }}>
          <h1 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: 16 }}>
            The admin console hit an unexpected error. Try refreshing the page.
          </p>
          <pre
            style={{
              background: '#fff5f5',
              border: '1px solid #fcc',
              padding: 12,
              borderRadius: 8,
              fontSize: '0.85rem',
              overflow: 'auto',
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            type="button"
            style={{ marginTop: 16, padding: '8px 16px', cursor: 'pointer' }}
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
