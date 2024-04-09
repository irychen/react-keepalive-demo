import { createHashRouter, Outlet } from 'react-router-dom';
import TabsPage from '../pages/tabs';
import HomeLayout from '../layouts/HomeLayout';
import BasicLayoutWithCache from '../layouts/BasicLayout';
import Counter from '../pages/counter';
import ExcludeCounter from '../pages/exclude-counter';

const router = createHashRouter([
    {
        path: '/',
        element: <BasicLayoutWithCache />,
        children: [
            {
                path: '/',
                element: (
                    <HomeLayout>
                        <Outlet />
                    </HomeLayout>
                ),
                children: [
                    {
                        path: '',
                        element: <div>Click the red button to navigate to the counter or tabs test page</div>,
                    },
                    {
                        path: 'counter',
                        element: <Counter />,
                    },
                    {
                        path: 'exclude-counter',
                        element: <ExcludeCounter />,
                    },
                ],
            },
            {
                path: 'counter2',
                element: <Counter />,
            },
        ],
    },
    {
        path: 'tabs',
        element: <TabsPage />,
    },
]);

export default router;
