import { ToastDisplay, ToastProvider } from '@bv/ui';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { router } from './routes/AppRouter';
import '@brilliant/components/style.css';
import '@bv/design-tokens/tokens.css';
import './index.scss';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from './config/queryClient';
import { ThemeProvider } from './layout/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <ToastProvider>
                    <RouterProvider router={router} />
                    <ToastDisplay />
                </ToastProvider>
            </ThemeProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
