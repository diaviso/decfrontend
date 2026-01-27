import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Shield,
  Globe,
  Palette,
  Lock,
  Eye,
  EyeOff,
  Save,
  Monitor,
  Loader2,
  Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface SettingsSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingsSwitch({ checked, onChange }: SettingsSwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}

export function SettingsPage() {
  const { isDark, toggleTheme } = useThemeStore();
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showProgress: true,
  });

  const [showInLeaderboard, setShowInLeaderboard] = useState(user?.showInLeaderboard ?? true);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSavePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: 'Erreur',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive',
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        title: 'Erreur',
        description: 'Le nouveau mot de passe doit contenir au moins 6 caractères.',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      toast({
        title: 'Mot de passe mis à jour',
        description: 'Votre mot de passe a été changé avec succès.',
      });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Une erreur est survenue.',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLeaderboardVisibilityChange = async (checked: boolean) => {
    setShowInLeaderboard(checked);

    try {
      const response = await api.patch('/auth/leaderboard-visibility', {
        showInLeaderboard: checked,
      });
      if (response.data.user) {
        updateUser(response.data.user);
      }
      toast({
        title: 'Préférence mise à jour',
        description: checked
          ? 'Vous apparaissez maintenant dans le classement.'
          : 'Vous n\'apparaissez plus dans le classement.',
      });
    } catch (error: unknown) {
      setShowInLeaderboard(!checked);
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Une erreur est survenue.',
        variant: 'destructive',
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Paramètres
        </h1>
        <p className="text-muted-foreground mt-1">
          Personnalisez votre expérience et gérez vos préférences
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appearance */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Apparence
              </CardTitle>
              <CardDescription>
                Personnalisez l'apparence de l'interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Thème</Label>
                  <p className="text-sm text-muted-foreground">
                    Choisissez votre thème préféré
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={!isDark ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => isDark && toggleTheme()}
                    className="gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Clair
                  </Button>
                  <Button
                    variant={isDark ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => !isDark && toggleTheme()}
                    className="gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Sombre
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    Sidebar réduite
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Réduire la barre latérale par défaut
                  </p>
                </div>
                <SettingsSwitch
                  checked={useThemeStore.getState().sidebarCollapsed}
                  onChange={() => useThemeStore.getState().toggleSidebar()}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>
                Gérez vos préférences de notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des mises à jour par email
                  </p>
                </div>
                <SettingsSwitch
                  checked={notifications.email}
                  onChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des notifications dans le navigateur
                  </p>
                </div>
                <SettingsSwitch
                  checked={notifications.push}
                  onChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Communications marketing</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevez des offres et nouveautés
                  </p>
                </div>
                <SettingsSwitch
                  checked={notifications.marketing}
                  onChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Sécurité
              </CardTitle>
              <CardDescription>
                Mettez à jour votre mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="h-11"
                />
              </div>
              <Button
                onClick={handleSavePassword}
                disabled={isChangingPassword || !passwords.current || !passwords.new || !passwords.confirm}
                className="w-full gap-2 mt-2"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Mettre à jour le mot de passe
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Confidentialité
              </CardTitle>
              <CardDescription>
                Contrôlez la visibilité de votre profil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Profil public</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre aux autres de voir votre profil
                  </p>
                </div>
                <SettingsSwitch
                  checked={privacy.profileVisible}
                  onChange={(checked) => setPrivacy({ ...privacy, profileVisible: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Afficher la progression</Label>
                  <p className="text-sm text-muted-foreground">
                    Montrer votre progression aux autres
                  </p>
                </div>
                <SettingsSwitch
                  checked={privacy.showProgress}
                  onChange={(checked) => setPrivacy({ ...privacy, showProgress: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                    Apparaître dans le classement
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre aux autres de voir votre rang et vos étoiles
                  </p>
                </div>
                <SettingsSwitch
                  checked={showInLeaderboard}
                  onChange={handleLeaderboardVisibilityChange}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Langue
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Langue de l'interface
                  </p>
                </div>
                <span className="text-sm font-medium text-foreground">Français</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Account Info */}
      <motion.div variants={itemVariants}>
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Zone dangereuse</CardTitle>
            <CardDescription>
              Actions irréversibles sur votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-foreground">Supprimer le compte</p>
              <p className="text-sm text-muted-foreground">
                Cette action supprimera définitivement votre compte et toutes vos données
              </p>
            </div>
            <Button variant="destructive" className="w-full sm:w-auto shrink-0">
              Supprimer mon compte
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
