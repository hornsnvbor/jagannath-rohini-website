import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminPanel from './pages/admin';
import { routes } from './routes';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: routes,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin',
    element: <AdminPanel />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
