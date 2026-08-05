import { Component } from 'react';
import './index.scss';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="error-boundary" role="alert">
          <p className="error-boundary__message">
            {this.props.message || 'Đã xảy ra lỗi khi tải nội dung này.'}
          </p>
          <button type="button" className="error-boundary__retry" onClick={this.handleRetry}>
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
