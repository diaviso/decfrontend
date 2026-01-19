import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  Award,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import { dashboardService } from '@/services/dashboard.service';
import type { DashboardStats, Activity, UserProgress } from '@/services/dashboard.service';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activitiesData, progressData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getUserActivity(),
          dashboardService.getUserProgress(),
        ]);
        setStats(statsData);
        setActivities(activitiesData);
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = stats ? [
    {
      title: 'Thèmes',
      value: stats.themes.toString(),
      change: 'Déontologie comptable',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Quiz complétés',
      value: stats.userQuizAttempts.toString(),
      change: `${stats.quizzes} quiz disponibles`,
      icon: HelpCircle,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Articles publiés',
      value: stats.blogs.toString(),
      change: 'Ressources disponibles',
      icon: FileText,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Discussions',
      value: stats.discussions.toString(),
      change: 'Forum actif',
      icon: MessageSquare,
      color: 'from-green-500 to-emerald-500',
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white"
      >
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Bonjour, {user?.firstName} ! 👋
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Bienvenue sur DEC Learning. Continuez votre apprentissage et atteignez vos objectifs.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <Award className="h-5 w-5" />
              <span>Niveau 12</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <TrendingUp className="h-5 w-5" />
              <span>2,450 XP</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <Clock className="h-5 w-5" />
              <span>32h d'apprentissage</span>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={item}>
              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}
                />
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Activité récente
              </CardTitle>
              <CardDescription>Vos dernières actions sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          activity.type === 'quiz'
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            : activity.type === 'article'
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        }`}
                      >
                        {activity.type === 'quiz' ? (
                          <HelpCircle className="h-5 w-5" />
                        ) : activity.type === 'article' ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <MessageSquare className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                      {activity.score && (
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {activity.score}
                        </span>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Aucune activité récente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Statistiques
              </CardTitle>
              <CardDescription>Votre progression globale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Quiz réussis</span>
                    <span className="text-sm text-muted-foreground">{progress?.quizSuccessRate || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress?.quizSuccessRate || 0}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Quiz complétés</span>
                    <span className="text-sm text-muted-foreground">{progress?.quizCompletionRate || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress?.quizCompletionRate || 0}%` }}
                      transition={{ delay: 0.6, duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Articles lus</span>
                    <span className="text-sm text-muted-foreground">{progress?.blogReadRate || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress?.blogReadRate || 0}%` }}
                      transition={{ delay: 0.7, duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Participation forum</span>
                    <span className="text-sm text-muted-foreground">{progress?.forumParticipationRate || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress?.forumParticipationRate || 0}%` }}
                      transition={{ delay: 0.8, duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
