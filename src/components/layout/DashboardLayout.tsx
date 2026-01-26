import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useThemeStore } from '@/store/theme';

export function DashboardLayout() {
  const { sidebarCollapsed } = useThemeStore();

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-[#0D1512] text-[#1A2E23] dark:text-[#E8F0EC]">
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
