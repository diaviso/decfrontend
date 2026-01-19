import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Users,
  HelpCircle,
  FileText,
  MessageSquare,
  TrendingUp,
  Star,
  Trophy,
  BarChart3,
  Activity,
  UserPlus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalQuizzes: number;
  totalAttempts: number;
  totalArticles: number;
  totalTopics: number;
  totalComments: number;
  globalSuccessRate: number;
  recentUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    stars: number;
  }>;
  topUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    stars: number;
  }>;
  attemptsByDay: Array<{
    date: string;
    count: number;
  }>;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/admin-stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const statsCards = stats
    ? [
        {
          title: 'Utilisateurs',
          value: stats.totalUsers.toString(),
          description: 'Utilisateurs inscrits',
          icon: Users,
          color: 'from-blue-500 to-cyan-500',
        },
        {
          title: 'Quiz',
          value: stats.totalQuizzes.toString(),
          description: `${stats.totalAttempts} tentatives`,
          icon: HelpCircle,
          color: 'from-purple-500 to-pink-500',
        },
        {
          title: 'Articles',
          value: stats.totalArticles.toString(),
          description: 'Articles publiés',
          icon: FileText,
          color: 'from-orange-500 to-red-500',
        },
        {
          title: 'Forum',
          value: stats.totalTopics.toString(),
          description: `${stats.totalComments} commentaires`,
          icon: MessageSquare,
          color: 'from-green-500 to-emerald-500',
        },
      ]
    : [];

  // Calculate max value for the chart
  const maxAttempts = stats?.attemptsByDay.length
    ? Math.max(...stats.attemptsByDay.map((d) => d.count), 1)
    : 1;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-8 text-white"
      >
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.05)'%3E%3C/path%3E%3C/svg%3E\")" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-2">
            <Trophy className="h-4 w-4" />
            Panneau d'administration
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Bonjour, {user?.firstName} !
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Vue d'ensemble de la plateforme DEC Learning
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span>{stats?.globalSuccessRate || 0}% taux de réussite global</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <span>{stats?.totalAttempts || 0} tentatives de quiz</span>
            </div>
          </div>
        </div>

        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
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
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
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

      {/* Charts and Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Activité des quiz (30 derniers jours)
              </CardTitle>
              <CardDescription>Nombre de tentatives par jour</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.attemptsByDay && stats.attemptsByDay.length > 0 ? (
                <div className="h-64 flex items-end gap-1">
                  {stats.attemptsByDay.slice(0, 30).reverse().map((day, index) => (
                    <div
                      key={index}
                      className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all hover:opacity-80"
                      style={{
                        height: `${(day.count / maxAttempts) * 100}%`,
                        minHeight: day.count > 0 ? '4px' : '0',
                      }}
                      title={`${new Date(day.date).toLocaleDateString('fr-FR')}: ${day.count} tentatives`}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>Aucune donnée disponible</p>
                </div>
              )}
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Il y a 30 jours</span>
                <span>Aujourd'hui</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Users */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top utilisateurs
              </CardTitle>
              <CardDescription>Classement par étoiles</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.topUsers && stats.topUsers.length > 0 ? (
                <div className="space-y-3">
                  {stats.topUsers.map((topUser, index) => (
                    <motion.div
                      key={topUser.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white ${
                          index === 0
                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                            : index === 1
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400'
                            : index === 2
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {topUser.firstName} {topUser.lastName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-bold">{topUser.stars}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto opacity-50 mb-4" />
                  <p>Aucun utilisateur</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Nouveaux utilisateurs
            </CardTitle>
            <CardDescription>Dernières inscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nom</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Étoiles</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((recentUser) => (
                      <tr key={recentUser.id} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">
                          {recentUser.firstName} {recentUser.lastName}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{recentUser.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                            <Star className="h-4 w-4 fill-current" />
                            <span>{recentUser.stars}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {getRelativeTime(recentUser.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto opacity-50 mb-4" />
                <p>Aucun nouvel utilisateur</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
