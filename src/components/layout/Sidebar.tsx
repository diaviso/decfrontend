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
  GraduationCap,
  User,
  Trophy,
  History,
  Bot,
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
];

// Menu items for admins
const adminMainMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: BookOpen, label: 'Thèmes', path: '/themes' },
  { icon: HelpCircle, label: 'Quiz', path: '/quizzes' },
  { icon: FileText, label: 'Blog', path: '/blog' },
  { icon: MessageSquare, label: 'Forum', path: '/forum' },
  { icon: Users, label: 'Utilisateurs', path: '/users' },
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

  // Select menu items based on role
  const menuItems = isAdmin ? adminMainMenuItems : userMainMenuItems;

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
                  ? 'bg-primary/10 dark:bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
                  isActive
                    ? 'gradient-primary text-white shadow-md shadow-primary/25'
                    : 'bg-muted/50 dark:bg-muted'
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
                  className="ml-auto h-2 w-2 rounded-full gradient-primary"
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

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 z-40 h-screen',
          'bg-card border-r border-border',
          'flex flex-col'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-bold text-foreground"
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
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
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
            <Separator className="my-4 bg-border" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
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
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-full h-10 text-muted-foreground hover:text-foreground hover:bg-muted"
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
