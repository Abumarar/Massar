import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';

import './index.css';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
setBaseUrl(baseUrl);
setAuthTokenGetter(() => localStorage.getItem('massar_admin_token'));

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
