import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import { adminMe } from '../../lib/api';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    adminMe()
      .then((res) => {
        if (!res.authenticated) {
          navigate('/admin/login', { replace: true });
          return;
        }
        setChecked(true);
      })
      .catch(() => navigate('/admin/login', { replace: true }));
  }, [navigate]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-muted-foreground">Checking session…</p>
      </div>
    );
  }

  return <AdminDashboard />;
}
