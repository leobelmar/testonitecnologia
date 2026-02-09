import { useAuth } from '@/contexts/AuthContext';
import { TecnicoDashboard } from '@/components/tecnico/TecnicoDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export default function Dashboard() {
  const { isTecnico } = useAuth();

  if (isTecnico) {
    return <TecnicoDashboard />;
  }

  return <AdminDashboard />;
}
