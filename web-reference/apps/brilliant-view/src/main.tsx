import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './index.scss';
import { router } from './routes/AppRouter';
import '@brilliant/components/style.css';
import '@bv/design-tokens/tokens.css';
import { DragAndDropWrapper } from '@brilliant/components';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import './assets/global.scss';
import { queryClient } from './config/queryClient';
import { ThemeProvider } from './layout/ThemeProvider';
import './assets/react-grid.scss';
import { ToastDisplay, ToastProvider } from '@bv/ui';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
            <ThemeProvider>
                <ToastProvider>
                    <DragAndDropWrapper>
                        <RouterProvider router={router} />
                    </DragAndDropWrapper>
                    <ToastDisplay />
                </ToastProvider>
            </ThemeProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
