import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Could log to a service in production
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          className="container"
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--spacing-lg)',
            padding: 'var(--spacing-xl)',
          }}
        >
          <h2 style={{ color: 'var(--color-text-primary)' }}>Something went wrong</h2>
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            We couldn’t load this page. Please try again.
          </p>
          <button
            type="button"
            className="auth-button"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
