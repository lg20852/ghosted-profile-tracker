
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.tsx';

// Enhanced error handling for global errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Prevent the error from crashing the entire app
  event.preventDefault();
});

// Add unhandled promise rejection handler with better logging
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  // Prevent the rejection from crashing the entire app
  event.preventDefault();
});

// Wrap the entire app in an error boundary
createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
