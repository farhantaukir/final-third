import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/auth.context';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className:
              '!border !border-slate-200 !rounded-xl !text-sm !font-medium !text-slate-900 !shadow-md',
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
