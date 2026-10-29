import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CyberShield View Render Error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '30px',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #D8D5CD',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          maxWidth: '600px',
          margin: '40px auto',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(183, 74, 74, 0.1)',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <AlertTriangle size={32} color="#B74A4A" />
          </div>
          <h3 style={{ margin: '0 0 8px', color: '#1A2620', fontSize: '1.25rem', fontWeight: '800' }}>
            View Loading Recovered
          </h3>
          <p style={{ margin: '0 0 20px', color: '#5A6E63', fontSize: '0.88rem', lineHeight: '1.5' }}>
            A temporary display error occurred while rendering this module. You can reload this view or return to the Dashboard.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#214C3A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} />
              <span>Retry Module</span>
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (window.location) window.location.hash = '';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F5F3ED',
                color: '#1A2620',
                border: '1px solid #D8D5CD',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Home size={15} />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
