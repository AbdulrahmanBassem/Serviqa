import { Component, type ErrorInfo, type ReactNode } from "react";
import styles from "./GlobalErrorBoundary.module.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // This is where we could log errors to a service like Sentry later
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <h1 className={styles.title}>Something went wrong.</h1>
          <p className={styles.message}>
            {this.state.error?.message || "An unexpected error occurred while loading the application."}
          </p>
          <button onClick={this.handleReload} className={styles.reloadButton}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}