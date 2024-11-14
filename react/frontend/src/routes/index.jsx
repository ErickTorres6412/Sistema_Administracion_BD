import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import BackupManager from '../components/backup/BackupManager';
import TablespaceManager from '../components/tablespace/TablespaceManager';
import TuningManager from '../components/tuning/TuningManager';
import PerformanceManager from '../components/performance/PerformanceManager';
import AuditManager from '../components/audit/AuditManager';
import SecurityManager from '../components/security/SecurityManager';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route path="/backup" element={<BackupManager />} />
          <Route path="/tablespaces" element={<TablespaceManager />} />
          <Route path="/tuning" element={<TuningManager />} />
          <Route path="/performance" element={<PerformanceManager />} />
          <Route path="/audit" element={<AuditManager />} />
          <Route path="/security" element={<SecurityManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;