import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import './index.css';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Future flags opt in to React Router v7 behaviour and silence upgrade warnings. */}
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
