import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { AuthLayout } from './layouts/AuthLayout/AuthLayout';
import { SignUp } from './pages/Auth/SignUp/SignUp';
import { queryClient } from '@lib/query-client';
import { Toaster } from 'react-hot-toast';
import { SignIn } from '@pages/Auth/SignIn/SignIn';

const router = createBrowserRouter([
    {
        path: '/auth',
        element: <AuthLayout />,
        children: [
            {
                path: 'sign-up',
                element: <SignUp />,
            },
            {
                path: 'sign-in',
                element: <SignIn />,
            },
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <Toaster
            position="bottom-center"
            toastOptions={{
                duration: 3000,
                style: {
                    background: 'var(--color-bg-ui)',
                    color: 'var(--color-text-main)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '1rem',
                    padding: '1rem 2rem',
                    fontSize: '1.6rem',
                    maxWidth: '40rem',
                },
            }}
        />
        <RouterProvider router={router} />
    </QueryClientProvider>,
);
