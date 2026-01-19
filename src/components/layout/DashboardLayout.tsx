import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useThemeStore } from '@/store/theme';

export function DashboardLayout() {
  const { sidebarCollapsed } = useThemeStore();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <Header />
      <motion.main
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="pt-16 min-h-screen"
      >
        <div className="p-6">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
