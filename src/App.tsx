import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import { routes } from './routes';

const router = createBrowserRouter([
  {
    element: (
      <RootLayout>
        <Outlet />
      </RootLayout>
    ),
    children: routes,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
