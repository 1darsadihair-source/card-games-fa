import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './App.css';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error)
    };
  }

  componentDidCatch(error) {
    console.error('FourBarg render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main dir="rtl" style={{ maxWidth: 720, margin: '8vh auto', padding: 24, color: '#f3f0e8', fontFamily: 'Tahoma, sans-serif', lineHeight: 2 }}>
          <div style={{ color: '#d8b879', fontSize: 13 }}>چهاربرگ · گزارش خطا</div>
          <h1 style={{ color: '#d8b879', fontSize: 38 }}>اجرای صفحه با خطا روبه‌رو شد</h1>
          <p>این پیام برای تشخیص علت صفحهٔ خالی اضافه شده است.</p>
          <pre dir="ltr" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 16, background: '#18352c', border: '1px solid #d8b87966', borderRadius: 10, color: '#fff' }}>{this.state.message || 'خطای نامشخص در نمایش برنامه'}</pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 16px', borderRadius: 8, border: 0, background: '#d8b879', color: '#182b22', fontWeight: 700 }}>بارگذاری دوباره</button>
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
