import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const navigate = useNavigate();
  const { isDark, toggleTheme, sidebarCollapsed } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [searchFocused, setSearchFocused] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <motion.header
      initial={false}
      animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'fixed top-0 right-0 z-30 h-16',
        'bg-background/80 backdrop-blur-xl',
        'border-b border-border',
        'flex items-center justify-between px-6'
      )}
      style={{ width: `calc(100% - ${sidebarCollapsed ? 80 : 280}px)` }}
    >
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <motion.div
          animate={{ width: searchFocused ? '100%' : '320px' }}
          className="relative"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className={cn(
              'pl-10 h-10 bg-muted/50 border-border rounded-xl',
              'focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary/30',
              'transition-all placeholder:text-muted-foreground'
            )}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="relative overflow-hidden h-10 w-10 rounded-xl hover:bg-muted"
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 0.9 : 1 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
          >
            {isDark ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-amber-500" />
            )}
          </motion.div>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-muted">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 hover:bg-muted">
              <Avatar className="h-9 w-9 ring-2 ring-border transition-all hover:ring-primary/40">
                <AvatarImage src="" alt={user?.firstName} />
                <AvatarFallback className="gradient-primary text-white font-medium text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-3 bg-muted/50 rounded-lg mb-2">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-semibold leading-none text-foreground">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <span className={cn(
                  'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium mt-2 w-fit',
                  user?.role === 'ADMIN'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-accent text-accent-foreground'
                )}>
                  {user?.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate('/profile')}
              className="rounded-lg cursor-pointer py-2.5"
            >
              <User className="mr-3 h-4 w-4 text-muted-foreground" />
              <span>Mon profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/settings')}
              className="rounded-lg cursor-pointer py-2.5"
            >
              <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="rounded-lg cursor-pointer py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
