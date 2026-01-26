import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  FileText,
  MessageSquare,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Trophy,
  History,
  Bot,
  Database,
  FolderOpen,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Menu items for regular users
const userMainMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Thèmes', path: '/themes' },
  { icon: HelpCircle, label: 'Quiz', path: '/quizzes' },
  { icon: History, label: 'Historique', path: '/history' },
  { icon: Trophy, label: 'Classement', path: '/leaderboard' },
  { icon: FileText, label: 'Blog', path: '/blog' },
  { icon: MessageSquare, label: 'Forum', path: '/forum' },
  { icon: Bot, label: 'Assistant DEC', path: '/chatbot' },
  { icon: Crown, label: 'Premium', path: '/premium' },
];

// Menu items for admins
const adminMainMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Thèmes', path: '/themes' },
  { icon: HelpCircle, label: 'Quiz', path: '/quizzes' },
  { icon: FileText, label: 'Blog', path: '/blog' },
  { icon: MessageSquare, label: 'Forum', path: '/forum' },
  { icon: FolderOpen, label: 'Catégories Forum', path: '/forum/categories' },
  { icon: Users, label: 'Utilisateurs', path: '/users' },
  { icon: Database, label: 'Base RAG', path: '/documents' },
  { icon: Bot, label: 'Assistant DEC', path: '/chatbot' },
  { icon: Crown, label: 'Abonnements', path: '/admin/subscriptions' },
];

const userAccountMenuItems = [
  { icon: User, label: 'Profil', path: '/profile' },
  { icon: Settings, label: 'Paramètres', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useThemeStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const isPremium = user?.isPremium || false;

  // Filter user menu items based on premium status (chatbot only for premium)
  const filteredUserMenuItems = userMainMenuItems.filter(item => {
    if (item.path === '/chatbot') {
      return isPremium; // Only show chatbot for premium users
    }
    return true;
  });

  // Select menu items based on role
  const menuItems = isAdmin ? adminMainMenuItems : filteredUserMenuItems;

  const NavItem = ({ item, isActive }: { item: typeof menuItems[0]; isActive: boolean }) => {
    const Icon = item.icon;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={item.path}>
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-[#00b4db] to-[#0083b0] text-white shadow-md shadow-[#00b4db]/25'
                    : 'bg-white/10'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !sidebarCollapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto h-2 w-2 rounded-full bg-[#F5A623]"
                />
              )}
            </motion.div>
          </Link>
        </TooltipTrigger>
        {sidebarCollapsed && (
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        )}
      </Tooltip>
    );
  };

  // Animated floating particles for sidebar background
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br from-[#1B5E3D]/20 to-[#3D9A6A]/10 blur-3xl"
      />
      <motion.div
        animate={{
          y: [0, 15, 0],
          x: [0, 10, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-1/3 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#F5A623]/15 to-[#F5A623]/5 blur-2xl"
      />
      <motion.div
        animate={{
          y: [0, 25, 0],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
        className="absolute bottom-1/4 -left-10 w-36 h-36 rounded-full bg-gradient-to-br from-[#2D7A50]/20 to-[#3D9A6A]/10 blur-3xl"
      />
      
      {/* Subtle animated lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]">
        <motion.line
          x1="0"
          y1="20%"
          x2="100%"
          y2="25%"
          stroke="#1B5E3D"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.line
          x1="0"
          y1="60%"
          x2="100%"
          y2="55%"
          stroke="#F5A623"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 4, delay: 1, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.line
          x1="0"
          y1="85%"
          x2="100%"
          y2="80%"
          stroke="#3D9A6A"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 5, delay: 2, repeat: Infinity, repeatType: 'reverse' }}
        />
      </svg>
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 z-40 h-screen overflow-hidden',
          'bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] dark:from-[#0a1628] dark:via-[#1a3a4a] dark:to-[#1e4d5c]',
          'border-r border-[#3d5a6a]/30 dark:border-[#2d4a5a]/50',
          'flex flex-col shadow-xl'
        )}
      >
        {/* Animated Background */}
        <FloatingParticles />
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          <Link to="/dashboard" className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="DEC Learning" 
              className="h-10 w-10 rounded-xl shadow-lg"
            />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-bold text-white"
                >
                  DEC Learning
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {/* Main Menu */}
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/50"
                >
                  Menu principal
                </motion.p>
              )}
            </AnimatePresence>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return <NavItem key={item.path} item={item} isActive={isActive} />;
            })}

            {/* User Account Section */}
            <Separator className="my-4 bg-white/10" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/50"
                >
                  Mon compte
                </motion.p>
              )}
            </AnimatePresence>
            {userAccountMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return <NavItem key={item.path} item={item} isActive={isActive} />;
            })}
          </nav>
        </ScrollArea>

        {/* Toggle Button */}
        <div className="border-t border-white/10 p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-full h-10 text-white/70 hover:text-white hover:bg-white/10"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
