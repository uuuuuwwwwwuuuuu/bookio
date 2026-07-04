import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { queryClient } from '@lib/query-client';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Auth
import { AuthLayout } from './layouts/AuthLayout/AuthLayout';
import { SignUp } from './pages/Auth/SignUp/SignUp';
import { SignIn } from '@pages/Auth/SignIn/SignIn';

// Organization
import { OrganizationLayout } from './layouts/OrganizationLayout/OrganizationLayout';
import { CreateOrganization } from './pages/Organization/CreateOrganization/CreateOrganization';
import { OrganizationList } from './pages/Organization/OrganizationList/OrganizationList';

// Main
import { MainLayout } from './layouts/MainLayout/MainLayout';

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
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                path: 'organization',
                element: <OrganizationLayout />,
                children: [
                    {
                        path: 'list',
                        element: <OrganizationList />,
                    },
                    {
                        path: 'create',
                        element: <CreateOrganization />,
                    }
                ]
            }
        ]
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
