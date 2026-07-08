import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazyRoute } from '@lib/lazy-route';
import { MainLayout } from '@layouts/MainLayout/MainLayout';
import { PageLoader } from '@components/PageLoader/PageLoader';

export const router = createBrowserRouter([
    {
        hydrateFallbackElement: <PageLoader />,
        children: [
            {
                path: '/auth',
                lazy: lazyRoute(() => import('@layouts/AuthLayout/AuthLayout'), 'AuthLayout'),
                children: [
                    {
                        index: true,
                        element: <Navigate to="sign-up" replace />,
                    },
                    {
                        path: 'sign-up',
                        lazy: lazyRoute(() => import('@pages/Auth/SignUp/SignUp'), 'SignUp'),
                    },
                    {
                        path: 'sign-in',
                        lazy: lazyRoute(() => import('@pages/Auth/SignIn/SignIn'), 'SignIn'),
                    },
                ],
            },
            {
                path: '/',
                element: <MainLayout />,
                children: [
                    {
                        path: 'organization',
                        lazy: lazyRoute(
                            () => import('@layouts/OrganizationLayout/OrganizationLayout'),
                            'OrganizationLayout',
                        ),
                        children: [
                            {
                                index: true,
                                element: <Navigate to="list" replace />,
                            },
                            {
                                path: 'list',
                                lazy: lazyRoute(
                                    () =>
                                        import('@pages/Organization/OrganizationList/OrganizationList'),
                                    'OrganizationList',
                                ),
                            },
                            {
                                path: 'create',
                                lazy: lazyRoute(
                                    () =>
                                        import('@pages/Organization/CreateOrganization/CreateOrganization'),
                                    'CreateOrganization',
                                ),
                            },
                            {
                                path: 'connect',
                                lazy: lazyRoute(
                                    () =>
                                        import('@pages/Organization/ConnectOrganization/ConnectOrganization'),
                                    'ConnectOrganization',
                                ),
                            },
                        ],
                    },
                ],
            },
        ],
    },
]);
